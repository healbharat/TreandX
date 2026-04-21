import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop({ default: false })
  isHidden: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ postId: 1, parentId: 1, createdAt: -1 });
