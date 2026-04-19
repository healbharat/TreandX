import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class EarningsService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getEarnings(userId: string) {
    const user = await this.userModel.findById(userId, 'earnings');
    if (!user) throw new NotFoundException('User not found');
    return { earnings: user.earnings };
  }

  async withdrawEarnings(userId: string, amount: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.earnings < amount) {
      throw new BadRequestException('Insufficient earnings for withdrawal');
    }

    user.earnings -= amount;
    await user.save();

    return { message: 'Withdrawal successful', remainingEarnings: user.earnings };
  }

  // Simulated engagement-based earnings update (internal use)
  async addEngagementEarnings(userId: string, increment: number) {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { earnings: increment },
    });
  }
}
