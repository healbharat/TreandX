import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Block extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blockerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  blockedId: Types.ObjectId;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
