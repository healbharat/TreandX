import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporterId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'pending' })
  status: string; // pending, resolved
}

export const ReportSchema = SchemaFactory.createForClass(Report);
