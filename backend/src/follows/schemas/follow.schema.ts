import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Follow extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  followerId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  followingId: string;

  @Prop({ default: 'accepted' }) // accepted / pending
  status: string;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
