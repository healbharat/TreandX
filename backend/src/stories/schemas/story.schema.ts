import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Story extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ required: true, enum: ['image', 'video', 'text'] })
  type: string;

  @Prop()
  caption?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  views: Types.ObjectId[];

  @Prop({ type: [{ 
    userId: { type: Types.ObjectId, ref: 'User' },
    type: { type: String } // emoji
  }], default: [] })
  reactions: { userId: Types.ObjectId, type: string }[];

  @Prop({ default: false })
  isHighlight: boolean;

  @Prop({ default: false })
  isCloseFriends: boolean;

  @Prop({ type: Object, default: null }) // sticker: { type: 'poll', question: '...', options: [...] }
  sticker: any;

  @Prop({ type: Array, default: [] }) // links or interactive elements
  elements: any[];

  @Prop({ type: [String], default: [] })
  mentions: string[];
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ userId: 1, expiresAt: 1 });
