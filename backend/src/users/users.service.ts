import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async setupProfile(id: string, profileData: { name: string; username: string; profileImage?: string }) {
    const existingUser = await this.userModel.findOne({ username: profileData.username, _id: { $ne: id } });
    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...profileData, isProfileComplete: true },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
