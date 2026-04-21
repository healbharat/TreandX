import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
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
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Save.name) private saveModel: Model<Save>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly earningsService: EarningsService,
    private readonly uploadService: UploadService,
  ) {}

  async getPostById(postId: string, userId?: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('userId', 'name username profileImage isPremium')
      .lean()
      .exec();

    if (!post) throw new NotFoundException('Post not found');

    let isLiked = false;
    let isSaved = false;
    if (userId) {
      isLiked = !!(await this.likeModel.exists({ userId: new Types.ObjectId(userId), postId: post._id }));
      isSaved = !!(await this.saveModel.exists({ userId: new Types.ObjectId(userId), postId: post._id }));
    }

    return { ...post, isLiked, isSaved };
  }

  async getFeed(page: number, limit: number, userId?: string) {
    const skip = (page - 1) * limit;

    const cacheKey = userId ? `feed:page1:${userId}` : 'feed:page1:guest';
    if (page === 1) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) return JSON.parse(cachedData);
    }

    const postCandidates = await this.postModel
      .find({ status: 'active' })
      .populate('userId', 'name username profileImage isPremium')
      .lean()
      .exec();

    let userFollowing: string[] = [];
    let userInterests: string[] = [];

    if (userId) {
      const user = await this.userModel.findById(userId).lean();
      if (user) {
        userInterests = user.interests || [];
        const follows = await this.followModel.find({ followerId: new Types.ObjectId(userId) }).lean();
        userFollowing = follows.map(f => f.followingId.toString());
      }
    }

    const rankedPosts = postCandidates.map(post => {
      let score = 0;
      score += (post.likesCount || 0) * 2;
      score += (post.commentsCount || 0) * 3;
      score += (post.sharesCount || 0) * 4;

      if (userId && userFollowing.includes((post.userId as any)._id.toString())) score += 10;
      
      // Interest match based on hashtags or caption mentions
      const hasInterestMatch = userInterests.some(interest => 
        post.caption?.toLowerCase().includes(interest.toLowerCase()) || 
        post.hashtags?.some(h => h.toLowerCase().includes(interest.toLowerCase()))
      );
      if (hasInterestMatch) score += 5;

      const hoursOld = (Date.now() - new Date((post as any).createdAt).getTime()) / (1000 * 60 * 60);
      score -= hoursOld;

      return { ...post, score };
    });

    const sortedPosts = rankedPosts.sort((a, b) => b.score - a.score);
    const paginatedPosts = sortedPosts.slice(skip, skip + limit);

    const finalPosts = await Promise.all(
      paginatedPosts.map(async (post) => {
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
      await this.redisService.set(cacheKey, JSON.stringify(finalPosts), 60);
    }

    return finalPosts;
  }

  async createPost(userId: string, body: any, files: any[]) {
    const mediaUrls: string[] = [];
    for (const file of files) {
      const url = await this.uploadService.uploadMedia(file);
      mediaUrls.push(url);
    }

    const hashtags = body.caption?.match(/#\w+/g) || [];
    const mentions = body.caption?.match(/@\w+/g) || [];

    const post = await this.postModel.create({
      userId: new Types.ObjectId(userId),
      mediaUrls,
      caption: body.caption,
      hashtags,
      mentions,
      location: body.location,
    });

    await this.earningsService.addEngagementEarnings(userId, 5);
    await this.redisService.del(`feed:page1:${userId}`);

    return post;
  }

  async updatePost(postId: string, userId: string, body: any) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId.toString() !== userId) throw new UnauthorizedException();

    const hashtags = body.caption?.match(/#\w+/g) || [];
    const mentions = body.caption?.match(/@\w+/g) || [];

    post.caption = body.caption;
    post.hashtags = hashtags;
    post.mentions = mentions;
    post.location = body.location;

    await post.save();
    return post;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId.toString() !== userId) throw new UnauthorizedException();

    for (const url of post.mediaUrls) {
      await this.uploadService.deleteImage(url);
    }

    await this.postModel.deleteOne({ _id: postId });
    return { success: true };
  }

  async getUserPosts(userId: string) {
    return this.postModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name username profileImage isPremium')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getSuggestedPosts(userId: string, limit: number = 2) {
    const follows = await this.followModel.find({ followerId: new Types.ObjectId(userId) }).lean();
    const followingIds = follows.map(f => f.followingId);

    return this.postModel
      .find({ 
        userId: { $nin: [...followingIds, new Types.ObjectId(userId)] },
        status: 'active'
      })
      .populate('userId', 'name username profileImage isPremium')
      .limit(limit)
      .lean()
      .exec();
  }
}
