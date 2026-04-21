import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true, sparse: true })
  mobile?: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ select: false })
  password?: string;

  @Prop()
  name?: string;

  @Prop({ unique: true, sparse: true })
  username?: string;

  @Prop()
  profileImage?: string;

  @Prop()
  fcmToken?: string;

  @Prop({ default: false })
  isProfileComplete: boolean;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop()
  bio: string;

  @Prop([String])
  links: string[];

  @Prop({ default: 'personal' })
  profileType: string; // 'personal' | 'creator' | 'business'

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ default: 0 })
  earnings: number;

  @Prop({ default: false })
  isPrivate: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ name: 'text', username: 'text' });
