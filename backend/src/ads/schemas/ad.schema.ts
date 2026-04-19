import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Ad extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl: string;

  @Prop()
  link: string;

  @Prop({ default: 'active' })
  status: string; // active, paused
}

export const AdSchema = SchemaFactory.createForClass(Ad);
