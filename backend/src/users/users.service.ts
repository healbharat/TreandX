import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { ProfileView } from './schemas/profile-view.schema';
import { Subscription } from './schemas/subscription.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ProfileView.name) private profileViewModel: Model<ProfileView>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: any) {
    if (data.username) {
      const existing = await this.userModel.findOne({ username: data.username, _id: { $ne: id } });
      if (existing) throw new ConflictException('Username already taken');
    }
    return this.userModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
  }

  async setupProfile(id: string, profileData: { name: string; username: string; profileImage?: string }) {
    const existingUser = await this.userModel.findOne({ username: profileData.username, _id: { $ne: id } });
    if (existingUser) throw new ConflictException('Username already taken');

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...profileData, isProfileComplete: true },
      { returnDocument: 'after' },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async trackProfileView(viewedId: string, viewerId: string) {
    if (viewedId === viewerId) return;
    return this.profileViewModel.create({
      viewedId: new Types.ObjectId(viewedId),
      viewerId: new Types.ObjectId(viewerId),
    });
  }

  async getCreatorAnalytics(userId: string) {
    const uId = new Types.ObjectId(userId);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [viewsCount, uniqueViewers, dailyStats] = await Promise.all([
      this.profileViewModel.countDocuments({ viewedId: uId }),
      this.profileViewModel.distinct('viewerId', { viewedId: uId }),
      this.profileViewModel.aggregate([
        { $match: { viewedId: uId, createdAt: { $gt: last30Days } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    return {
      totalViews: viewsCount,
      uniqueReach: uniqueViewers.length,
      sparkline: dailyStats,
    };
  }

  async subscribeToCreator(subscriberId: string, creatorId: string, planName: string, amount: number) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); 

    return this.subscriptionModel.create({
      subscriberId: new Types.ObjectId(subscriberId),
      creatorId: new Types.ObjectId(creatorId),
      planName,
      amount,
      expiresAt,
    });
  }

  async checkSubscription(subscriberId: string, creatorId: string) {
    const active = await this.subscriptionModel.findOne({
      subscriberId: new Types.ObjectId(subscriberId),
      creatorId: new Types.ObjectId(creatorId),
      expiresAt: { $gt: new Date() },
      status: 'active'
    });
    return !!active;
  }
}
