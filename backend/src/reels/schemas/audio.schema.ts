import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Audio extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  audioUrl: string;

  @Prop()
  artist: string;

  @Prop({ default: 0 })
  usageCount: number;
}

export const AudioSchema = SchemaFactory.createForClass(Audio);
AudioSchema.index({ title: 'text', artist: 'text' });
