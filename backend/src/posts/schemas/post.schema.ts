import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, default: 'Local' })
  category: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  summary?: string;

  @Prop()
  headline?: string;

  @Prop({ default: 'active' })
  status: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ content: 'text', category: 'text' });
