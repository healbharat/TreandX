import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow } from './schemas/follow.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async toggleFollow(userId: string, currentUserId: string) {
    if (currentUserId === userId) {
      throw new BadRequestException("Cannot follow yourself");
    }

    const existing = await this.followModel.findOne({
      followerId: currentUserId,
      followingId: userId,
    });

    // 🔁 UNFOLLOW (or cancel request)
    if (existing) {
      await this.followModel.deleteOne({ _id: existing._id });

      if (existing.status === 'accepted') {
        await this.userModel.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
        await this.userModel.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
        return { message: "Unfollowed" };
      }

      return { message: "Request cancelled" };
    }

    // 🔒 PRIVATE ACCOUNT
    const targetUser = await this.userModel.findById(userId);
    if (!targetUser) {
        throw new NotFoundException("User not found");
    }

    if (targetUser.isPrivate) {
      await this.followModel.create({
        followerId: currentUserId,
        followingId: userId,
        status: "pending",
      });

      return { message: "Follow request sent" };
    }

    // ✅ FOLLOW
    await this.followModel.create({
      followerId: currentUserId,
      followingId: userId,
      status: "accepted",
    });

    await this.userModel.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
    await this.userModel.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

    return { message: "Followed" };
  }

  async handleRequest(requestId: string, action: 'accept' | 'reject') {
    const request = await this.followModel.findById(requestId);

    if (!request) {
        throw new NotFoundException("Request not found");
    }

    if (action === "accept") {
      request.status = "accepted";
      await request.save();

      await this.userModel.findByIdAndUpdate(request.followingId, { $inc: { followersCount: 1 } });
      await this.userModel.findByIdAndUpdate(request.followerId, { $inc: { followingCount: 1 } });

      return { message: "Accepted" };
    }

    await this.followModel.deleteOne({ _id: requestId });
    return { message: "Rejected" };
  }

  async getFollowers(userId: string) {
    return this.followModel
      .find({ followingId: userId, status: "accepted" })
      .populate('followerId');
  }

  async getFollowing(userId: string) {
    return this.followModel
      .find({ followerId: userId, status: "accepted" })
      .populate('followingId');
  }

  async getSuggestions(currentUserId: string) {
    const following = await this.followModel.find({
      followerId: currentUserId
    });

    const followingIds = following.map(f => f.followingId);

    return this.userModel.find({
      _id: { $nin: [...followingIds, currentUserId] }
    }).limit(10);
  }

  async getMutualConnections(userId: string, currentUserId: string) {
    const myFollowing = await this.followModel.find({ followerId: currentUserId });
    const targetFollowers = await this.followModel.find({ followingId: userId });

    const myIds = myFollowing.map(f => f.followingId.toString());
    const targetIds = targetFollowers.map(f => f.followerId.toString());

    const mutualIds = myIds.filter(id => targetIds.includes(id));

    return this.userModel.find({ _id: { $in: mutualIds } });
  }

  async getPendingRequests(currentUserId: string) {
    return this.followModel
      .find({ followingId: currentUserId, status: 'pending' })
      .populate('followerId');
  }
}
