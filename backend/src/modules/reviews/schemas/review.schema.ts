import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Tour } from '../../tours/schemas/tour.schema';
export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: mongoose.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Tour.name,
    required: true,
  })
  tour: mongoose.Types.ObjectId;
  @Prop({ required: true }) content: string;
  @Prop({ default: 0, min: 0, max: 5 }) rating: number;
}
export const ReviewSchema = SchemaFactory.createForClass(Review);
