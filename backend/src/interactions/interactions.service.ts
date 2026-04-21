import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { Follow } from './schemas/follow.schema';
import { CommentLike } from './schemas/comment-like.schema';
import { Like } from '../posts/schemas/like.schema';
import { Post } from '../posts/schemas/post.schema';
import { EventsGateway } from '../events/events.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InteractionsService {
  private getBannedWords(): string[] {
    const configBanned = this.configService.get('BANNED_WORDS', '');
    if (configBanned) return configBanned.split(',').map((w: string) => w.trim().toLowerCase());
    return ["badword1", "badword2", "spam", "scam", "offensive"];
  }

  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(CommentLike.name) private commentLikeModel: Model<CommentLike>,
    private readonly eventsGateway: EventsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async addComment(userId: string, postId: string, text: string, parentId: string | null = null) {
    const textLower = text.toLowerCase();
    const bannedWords = this.getBannedWords();
    
    // 🔥 Offensive filter (basic)
    if (bannedWords.some(word => textLower.includes(word))) {
      throw new UnauthorizedException("Comment blocked (offensive content detected)");
    }

    if (parentId) {
      const parentComment = await this.commentModel.findById(parentId);
      if (!parentComment) throw new NotFoundException('Parent comment not found');
      if (parentComment.parentId) {
        throw new UnauthorizedException('Comment depth limit reached (max 2 levels)');
      }
    }

    const comment = await this.commentModel.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      text,
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    
    const populated = await (comment as any).populate('userId', 'name username profileImage');
    
    this.eventsGateway.emitNewComment({
      postId,
      comment: populated,
    });

    // Notify post owner or original comment owner (if reply)
    const post = await this.postModel.findById(postId);
    if (post && post.userId.toString() !== userId) {
      await this.notificationsService.create({
        userId: post.userId.toString(),
        senderId: userId,
        type: NotificationType.COMMENT,
        message: `${(populated.userId as any).name} commented on your post`,
        postId,
      });
    }

    if (parentId) {
      const parentComment = await this.commentModel.findById(parentId);
      if (parentComment && parentComment.userId.toString() !== userId) {
        await this.notificationsService.create({
          userId: parentComment.userId.toString(),
          senderId: userId,
          type: NotificationType.COMMENT,
          message: `${(populated.userId as any).name} replied to your comment`,
          postId,
        });
      }
    }

    return populated;
  }

  async getComments(postId: string, userId?: string) {
    const mainComments = await this.commentModel
      .find({ postId: new Types.ObjectId(postId), parentId: null, isHidden: false })
      .populate('userId', 'name username profileImage')
      .sort({ isPinned: -1, createdAt: -1 })
      .lean()
      .exec();

    const replies = await this.commentModel
      .find({ postId: new Types.ObjectId(postId), parentId: { $ne: null }, isHidden: false })
      .populate('userId', 'name username profileImage')
      .lean()
      .exec();

    const processComments = async (cmts: any[]) => {
      return Promise.all(cmts.map(async (c) => {
        let isLiked = false;
        if (userId) {
          isLiked = !!(await this.commentLikeModel.exists({ userId: new Types.ObjectId(userId), commentId: c._id }));
        }
        return { ...c, isLiked };
      }));
    };

    const mainWithMeta = await processComments(mainComments);
    const repliesWithMeta = await processComments(replies);

    return mainWithMeta.map(c => ({
      ...c,
      replies: repliesWithMeta.filter(r => r.parentId.toString() === c._id.toString())
    }));
  }

  async toggleCommentLike(commentId: string, userId: string) {
    const cId = new Types.ObjectId(commentId);
    const uId = new Types.ObjectId(userId);

    const existing = await this.commentLikeModel.findOne({ userId: uId, commentId: cId });

    if (existing) {
      await this.commentLikeModel.deleteOne({ _id: existing._id });
      const comment = await this.commentModel.findByIdAndUpdate(cId, { $inc: { likesCount: -1 } }, { new: true });
      
      this.eventsGateway.server.emit("commentLiked", { commentId, likesCount: comment?.likesCount });
      return { liked: false };
    } else {
      await this.commentLikeModel.create({ userId: uId, commentId: cId });
      const comment = await this.commentModel.findByIdAndUpdate(cId, { $inc: { likesCount: 1 } }, { new: true });
      
      this.eventsGateway.server.emit("commentLiked", { commentId, likesCount: comment?.likesCount });
      return { liked: true };
    }
  }

  async pinComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const post = await this.postModel.findById(comment.postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.userId.toString() !== userId) {
      throw new UnauthorizedException('Only the post owner can pin comments');
    }

    await this.commentModel.updateMany({ postId: post._id }, { isPinned: false });

    comment.isPinned = true;
    await comment.save();

    return { success: true };
  }

  async hideComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const post = await this.postModel.findById(comment.postId);
    if (!post) throw new NotFoundException('Post not found');
    
    if (post.userId.toString() !== userId && comment.userId.toString() !== userId) {
       throw new UnauthorizedException('Unauthorized to hide this comment');
    }

    comment.isHidden = true;
    await comment.save();

    return { success: true };
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
      this.eventsGateway.emitNewLike({ postId, likesCount: post?.likesCount || 0 });
      return { liked: false };
    } else {
      await this.likeModel.create({ userId: uId, postId: pId });
      const post = await this.postModel.findByIdAndUpdate(pId, { $inc: { likesCount: 1 } }, { new: true });
      this.eventsGateway.emitNewLike({ postId, likesCount: post?.likesCount || 0 });
      if (post && post.userId.toString() !== userId) {
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
    const post = await this.postModel.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } }, { new: true });
    if (!post) throw new NotFoundException('Post not found');
    this.eventsGateway.emitPostShared({ postId, sharesCount: post.sharesCount });
    return { sharesCount: post.sharesCount };
  }

  async getSavedPosts(userId: string) {
    const saves = await this.commentModel.db.model('Save').find({ userId: new Types.ObjectId(userId) });
    const postIds = saves.map(s => s.postId);
    return this.postModel.find({ _id: { $in: postIds } }).populate('userId', 'name username profileImage isPremium').sort({ createdAt: -1 }).exec();
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const existing = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return { following: !!existing };
  }
}
