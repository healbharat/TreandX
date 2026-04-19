import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  mobile: string;

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
  premiumExpiry: Date;

  @Prop({ default: 0 })
  earnings: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ name: 'text', username: 'text' });
