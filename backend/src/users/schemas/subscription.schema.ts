import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  subscriberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;

  @Prop({ required: true })
  planName: string; // Silver, Gold, Platinum

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 'active' })
  status: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ subscriberId: 1, creatorId: 1 });
