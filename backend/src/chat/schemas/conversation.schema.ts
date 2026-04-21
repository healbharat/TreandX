import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  members: Types.ObjectId[];

  @Prop({ default: false })
  isGroup: boolean;

  @Prop()
  groupName?: string;

  @Prop()
  groupImage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ members: 1 });
