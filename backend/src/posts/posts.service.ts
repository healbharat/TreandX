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
import { EarningsService } from '../earnings/earnings.service';
import { UploadService } from './upload.service';

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
    private readonly earningsService: EarningsService,
    private readonly uploadService: UploadService,
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
      .find({ status: 'active' })
      .populate('userId', 'name username profileImage isPremium')
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



  async getUserPosts(userId: string) {
    return this.postModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name username profileImage isPremium')
      .sort({ createdAt: -1 })
      .exec();
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });

    if (!post) throw new Error('Post not found or unauthorized');

    if (post.imageUrl) {
      await this.uploadService.deleteImage(post.imageUrl);
    }

    await this.postModel.deleteOne({ _id: post._id });
    await this.redisService.del('feed:first_page'); // Invalidate cache

    return { success: true };
  }

  async createPost(userId: string, content: string, category: string, imageUrl?: string, headline?: string) {
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
      headline,
    });

    // Award earnings for creating a post
    await this.earningsService.addEngagementEarnings(userId, 5); // 5 units per post

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
