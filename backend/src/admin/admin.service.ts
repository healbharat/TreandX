import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';
import { Report } from '../reports/schemas/report.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Report.name) private reportModel: Model<Report>,
  ) {}

  // User Moderation
  async getAllUsers() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async toggleUserBlock(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    return user;
  }

  // Post Moderation
  async getAllPosts() {
    return this.postModel
      .find()
      .populate('userId', 'name username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async blockPost(postId: string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      { status: 'blocked' },
      { new: true },
    );
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  // Report Moderation
  async getAllReports() {
    return this.reportModel
      .find()
      .populate('reporterId', 'name username')
      .populate({
        path: 'postId',
        populate: { path: 'userId', select: 'name username' }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async resolveReport(reportId: string) {
    const report = await this.reportModel.findByIdAndUpdate(
      reportId,
      { status: 'resolved' },
      { new: true },
    );
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  // Stats for Dashboard
  async getDashboardStats() {
    const [userCount, postCount, pendingReports] = await Promise.all([
      this.userModel.countDocuments(),
      this.postModel.countDocuments(),
      this.reportModel.countDocuments({ status: 'pending' }),
    ]);

    return { userCount, postCount, pendingReports };
  }
}
