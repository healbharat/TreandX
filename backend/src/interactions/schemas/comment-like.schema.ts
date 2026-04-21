import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CommentLike extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment', required: true })
  commentId: Types.ObjectId;
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });
