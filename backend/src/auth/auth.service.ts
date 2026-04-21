import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../common/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async register(data: any) {
    const { username, email, mobile, password } = data;

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }, { mobile }].filter(q => q[Object.keys(q)[0]])
    });

    if (existingUser) {
      throw new BadRequestException('User with this username, email or mobile already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      ...data,
      password: hashedPassword,
    });

    return this.generateAuthResponse(user);
  }

  async login(data: any) {
    const { identifier, password } = data; // identifier can be username, email, or mobile

    const user = await this.userModel.findOne({
      $or: [{ username: identifier }, { email: identifier }, { mobile: identifier }]
    }).select('+password');

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async verifyFirebase(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { phone_number, email, name, picture, uid } = decodedToken;

      let user = await this.userModel.findOne({
        $or: [
          ...(phone_number ? [{ mobile: phone_number }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (!user) {
        // Auto-register
        user = await this.userModel.create({
          mobile: phone_number,
          email: email,
          name: name,
          profileImage: picture,
          isProfileComplete: false,
        });
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async sendOtp(mobile: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.set(`otp:${mobile}`, otp, 120);
    console.log(`[AUTH] OTP for ${mobile}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(mobile: string, otp: string) {
    const storedOtp = await this.redisService.get(`otp:${mobile}`);
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    await this.redisService.del(`otp:${mobile}`);

    let user = await this.userModel.findOne({ mobile });
    if (!user) {
      user = await this.userModel.create({ mobile, isProfileComplete: false });
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: any) {
    const payload = { sub: user._id, mobile: user.mobile, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      isNewUser: !user.isProfileComplete,
      user: {
        id: user._id,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
        isProfileComplete: user.isProfileComplete,
        role: user.role,
      },
    };
  }
}
