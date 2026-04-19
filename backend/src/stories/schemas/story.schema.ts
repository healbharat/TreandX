import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Story extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ default: 'image' })
  type: string; // image, video, text

  @Prop()
  caption: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  views: Types.ObjectId[];

  @Prop({ type: [{ 
    userId: { type: Types.ObjectId, ref: 'User' },
    type: { type: String } // emoji
  }], default: [] })
  reactions: { userId: Types.ObjectId, type: string }[];

  @Prop({ default: 'followers' })
  visibility: string; // public, followers, close_friends
}

export const StorySchema = SchemaFactory.createForClass(Story);
