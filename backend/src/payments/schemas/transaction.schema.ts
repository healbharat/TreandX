import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  orderId: string;

  @Prop()
  paymentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending' })
  status: string; // pending, success, failed
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
