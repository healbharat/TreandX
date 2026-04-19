import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { Follow } from './schemas/follow.schema';
import { Like } from '../posts/schemas/like.schema';
import { Post } from '../posts/schemas/post.schema';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addComment(userId: string, postId: string, content: string) {
    const comment = await this.commentModel.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      content,
    });
    
    const populated = await comment.populate('userId', 'name username profileImage');
    const sender = populated.userId as any;
    
    this.eventsGateway.emitNewComment({
      postId,
      comment: populated,
    });

    // Send Notification to Post Owner
    const post = await this.postModel.findById(postId);
    if (post) {
      await this.notificationsService.create({
        userId: post.userId.toString(),
        senderId: userId,
        type: NotificationType.COMMENT,
        message: `${sender.name} commented on your post: "${content.substring(0, 20)}..."`,
        postId,
      });
    }

    return populated;
  }

  async getComments(postId: string) {
    return this.commentModel
      .find({ postId: new Types.ObjectId(postId) })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');

    const fId = new Types.ObjectId(followerId);
    const tId = new Types.ObjectId(followingId);

    const existing = await this.followModel.findOne({ followerId: fId, followingId: tId });

    if (existing) {
      await this.followModel.deleteOne({ _id: existing._id });
      return { following: false };
    } else {
      await this.followModel.create({ followerId: fId, followingId: tId });
      
      this.eventsGateway.emitNewFollow({
        followerId,
        followingId,
      });

      // Send Notification to followed user
      const follower = await this.commentModel.db.model('User').findById(followerId);
      await this.notificationsService.create({
        userId: followingId,
        senderId: followerId,
        type: NotificationType.FOLLOW,
        message: `${follower?.name || 'Someone'} started following you`,
      });

      return { following: true };
    }
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const existing = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return { following: !!existing };
  }
}
