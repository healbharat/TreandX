import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story } from './schemas/story.schema';
import { Follow } from '../interactions/schemas/follow.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    @InjectModel(Follow.name) private followModel: Model<Follow>,
  ) {}

  async createStory(userId: string, data: any) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return this.storyModel.create({
      userId: new Types.ObjectId(userId),
      ...data,
      expiresAt,
    });
  }

  async getFollowingStories(userId: string) {
    const following = await this.followModel.find({ followerId: new Types.ObjectId(userId) }).select('followingId');
    const followingIds = following.map(f => f.followingId);
    
    // Add own userId to see own stories
    followingIds.push(new Types.ObjectId(userId));

    const now = new Date();
    const stories = await this.storyModel
      .find({
        userId: { $in: followingIds },
        expiresAt: { $gt: now },
      })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .exec();

    // Group stories by userId for the horizontal bar
    const grouped = stories.reduce((acc, story: any) => {
      const uId = story.userId._id.toString();
      if (!acc[uId]) {
        acc[uId] = {
          user: story.userId,
          stories: [],
        };
      }
      acc[uId].stories.push(story);
      return acc;
    }, {});

    return Object.values(grouped);
  }

  async trackView(storyId: string, userId: string) {
    return this.storyModel.findByIdAndUpdate(
      storyId,
      { $addToSet: { views: new Types.ObjectId(userId) } },
      { new: true }
    );
  }

  async addReaction(storyId: string, userId: string, type: string) {
    return this.storyModel.findByIdAndUpdate(
      storyId,
      { $push: { reactions: { userId: new Types.ObjectId(userId), type } } },
      { new: true }
    );
  }

  async deleteStory(storyId: string, userId: string) {
    const story = await this.storyModel.findOne({
      _id: new Types.ObjectId(storyId),
      userId: new Types.ObjectId(userId),
    });
    if (!story) throw new Error('Story not found or unauthorized');

    await this.storyModel.deleteOne({ _id: story._id });
    return { success: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredStories() {
    const now = new Date();
    const result = await this.storyModel.deleteMany({ expiresAt: { $lt: now } });
    console.log(`[STORY CRON] Deleted ${result.deletedCount} expired stories.`);
  }
}
