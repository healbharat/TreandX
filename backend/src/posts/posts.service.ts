import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { Like } from './schemas/like.schema';
import { Save } from './schemas/save.schema';
import { RedisService } from '../common/redis.service';
import { ConfigService } from '@nestjs/config';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { Follow } from '../interactions/schemas/follow.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Save.name) private saveModel: Model<Save>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getFeed(page: number, limit: number, userId?: string) {
    const skip = (page - 1) * limit;

    // Cache first page for performance
    if (page === 1) {
      const cachedData = await this.redisService.get('feed:first_page');
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    const posts = await this.postModel
      .find()
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Check if liked/saved by current user
    const postsWithMeta = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        let isSaved = false;
        if (userId) {
          isLiked = !!(await this.likeModel.exists({ userId: new Types.ObjectId(userId), postId: post._id }));
          isSaved = !!(await this.saveModel.exists({ userId: new Types.ObjectId(userId), postId: post._id }));
        }
        return { ...post, isLiked, isSaved };
      }),
    );

    if (page === 1) {
      await this.redisService.set('feed:first_page', JSON.stringify(postsWithMeta), 60); // Cache for 60s
    }

    return postsWithMeta;
  }

  async toggleLike(postId: string, userId: string) {
    const pId = new Types.ObjectId(postId);
    const uId = new Types.ObjectId(userId);

    const existingLike = await this.likeModel.findOne({ userId: uId, postId: pId });

    if (existingLike) {
      await this.likeModel.deleteOne({ _id: existingLike._id });
      await this.postModel.findByIdAndUpdate(pId, { $inc: { likesCount: -1 } });
      return { liked: false };
    } else {
      await this.likeModel.create({ userId: uId, postId: pId });
      await this.postModel.findByIdAndUpdate(pId, { $inc: { likesCount: 1 } });
      
      this.eventsGateway.emitNewLike({
        postId,
        userId,
      });

      // Send Notification to Post Owner
      const post = await this.postModel.findById(postId);
      const liker = await this.postModel.db.model('User').findById(userId);
      if (post && liker) {
        await this.notificationsService.create({
          userId: post.userId.toString(),
          senderId: userId,
          type: NotificationType.LIKE,
          message: `${liker.name} liked your post`,
          postId,
        });
      }

      return { liked: true };
    }
  }

  async toggleSave(postId: string, userId: string) {
    const pId = new Types.ObjectId(postId);
    const uId = new Types.ObjectId(userId);

    const existingSave = await this.saveModel.findOne({ userId: uId, postId: pId });

    if (existingSave) {
      await this.saveModel.deleteOne({ _id: existingSave._id });
      return { saved: false };
    } else {
      await this.saveModel.create({ userId: uId, postId: pId });
      return { saved: true };
    }
  }

  async createPost(userId: string, content: string, category: string, imageUrl?: string) {
    const abusiveWords = this.configService.get('ABUSIVE_WORDS', '').split(',');
    let isFlagged = false;

    // Basic Moderation
    const contentLower = content.toLowerCase();
    for (const word of abusiveWords) {
      if (word && contentLower.includes(word.trim())) {
        isFlagged = true;
        break;
      }
    }

    const post = await this.postModel.create({
      userId: new Types.ObjectId(userId),
      content,
      category,
      imageUrl,
      isFlagged,
    });

    // Clear feed cache so new post appears
    await this.redisService.del('feed:first_page');

    // Notify all followers
    const user = await this.postModel.db.model('User').findById(userId);
    const followers = await this.followModel.find({ followingId: new Types.ObjectId(userId) });
    
    for (const follow of followers) {
      await this.notificationsService.create({
        userId: follow.followerId.toString(),
        senderId: userId,
        type: NotificationType.POST,
        message: `${user?.name || 'A user you follow'} posted a new update`,
        postId: post._id as any,
      });
    }

    return post;
  }
}
