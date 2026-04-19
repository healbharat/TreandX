import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async sendOtp(mobile: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store OTP in Redis for 2 minutes
    await this.redisService.set(`otp:${mobile}`, otp, 120);
    
    console.log(`\n-----------------------------------------`);
    console.log(`[AUTH] OTP for ${mobile}: ${otp}`);
    console.log(`-----------------------------------------\n`);
    
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(mobile: string, otp: string) {
    const storedOtp = await this.redisService.get(`otp:${mobile}`);
    
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    await this.redisService.del(`otp:${mobile}`);

    let user = await this.userModel.findOne({ mobile });
    let isNewUser = false;

    if (!user) {
      user = await this.userModel.create({ mobile });
      isNewUser = true;
    } else if (!user.isProfileComplete) {
      isNewUser = true;
    }

    const payload = { sub: user._id, mobile: user.mobile };
    const token = this.jwtService.sign(payload);

    return {
      token,
      isNewUser,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }
}
