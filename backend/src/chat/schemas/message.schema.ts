import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop()
  text?: string;

  @Prop()
  mediaUrl?: string;

  @Prop({ enum: ['image', 'video', 'voice', 'file', null], default: null })
  mediaType?: string;

  @Prop({ type: [{ 
    userId: { type: Types.ObjectId, ref: 'User' },
    emoji: String 
  }], default: [] })
  reactions: { userId: Types.ObjectId, emoji: string }[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  seenBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: -1 });
