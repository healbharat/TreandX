import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [String] }) // multiple images/videos
  mediaUrls: string[];

  @Prop()
  caption: string;

  @Prop({ type: [String] })
  hashtags: string[];

  @Prop({ type: [String] })
  mentions: string[];

  @Prop()
  location: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ default: 'active' })
  status: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ caption: 'text', hashtags: 'text', location: 'text' });
