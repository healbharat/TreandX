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
}

export const UserSchema = SchemaFactory.createForClass(User);
