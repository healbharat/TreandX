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
      
      // Update counts
      await this.postModel.db.model('User').findByIdAndUpdate(fId, { $inc: { followingCount: -1 } });
      await this.postModel.db.model('User').findByIdAndUpdate(tId, { $inc: { followersCount: -1 } });

      return { following: false };
    } else {
      await this.followModel.create({ followerId: fId, followingId: tId });
      
      // Update counts
      await this.postModel.db.model('User').findByIdAndUpdate(fId, { $inc: { followingCount: 1 } });
      await this.postModel.db.model('User').findByIdAndUpdate(tId, { $inc: { followersCount: 1 } });

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

  async toggleLike(postId: string, userId: string) {
    const pId = new Types.ObjectId(postId);
    const uId = new Types.ObjectId(userId);

    const existingLike = await this.likeModel.findOne({ userId: uId, postId: pId });

    if (existingLike) {
      await this.likeModel.deleteOne({ _id: existingLike._id });
      const post = await this.postModel.findByIdAndUpdate(pId, { $inc: { likesCount: -1 } }, { new: true });
      
      this.eventsGateway.emitNewLike({
        postId,
        likesCount: post?.likesCount || 0,
      });

      return { liked: false };
    } else {
      await this.likeModel.create({ userId: uId, postId: pId });
      const post = await this.postModel.findByIdAndUpdate(pId, { $inc: { likesCount: 1 } }, { new: true });
      
      this.eventsGateway.emitNewLike({
        postId,
        likesCount: post?.likesCount || 0,
      });

      // Send Notification to Post Owner
      if (post) {
        const liker = await this.commentModel.db.model('User').findById(userId);
        await this.notificationsService.create({
          userId: post.userId.toString(),
          senderId: userId,
          type: NotificationType.LIKE,
          message: `${liker?.name || 'Someone'} liked your post`,
          postId,
        });
      }

      return { liked: true };
    }
  }

  async toggleSave(postId: string, userId: string) {
    const pId = new Types.ObjectId(postId);
    const uId = new Types.ObjectId(userId);

    const existingSave = await this.commentModel.db.model('Save').findOne({ userId: uId, postId: pId });

    if (existingSave) {
      await this.commentModel.db.model('Save').deleteOne({ _id: existingSave._id });
      return { saved: false };
    } else {
      await this.commentModel.db.model('Save').create({ userId: uId, postId: pId });
      return { saved: true };
    }
  }

  async sharePost(postId: string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
    if (!post) throw new NotFoundException('Post not found');

    this.eventsGateway.emitPostShared({
      postId,
      sharesCount: post.sharesCount,
    });

    return { sharesCount: post.sharesCount };
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const existing = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return { following: !!existing };
  }
}
