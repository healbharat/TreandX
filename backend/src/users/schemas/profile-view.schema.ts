import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProfileView extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  viewedId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  viewerId: Types.ObjectId;
}

export const ProfileViewSchema = SchemaFactory.createForClass(ProfileView);
ProfileViewSchema.index({ viewedId: 1, viewerId: 1, createdAt: -1 });
