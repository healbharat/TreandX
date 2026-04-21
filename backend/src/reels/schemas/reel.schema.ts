import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Reel extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  thumbnail: string;

  @Prop()
  caption: string;

  @Prop({ type: Types.ObjectId, ref: 'Audio', required: false, default: null })
  audioId: Types.ObjectId | null;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ type: Types.ObjectId, ref: 'Reel', default: null })
  remixFrom: Types.ObjectId | null;
}

export const ReelSchema = SchemaFactory.createForClass(Reel);
ReelSchema.index({ userId: 1, createdAt: -1 });
