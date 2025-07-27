// src/modules/bookings/schemas/booking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Tour } from '../../tours/schemas/tour.schema';
export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
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
  @Prop() num_people: number;
  @Prop() total_price: number;
  @Prop({ default: 'pending' }) status: string;
}
export const BookingSchema = SchemaFactory.createForClass(Booking);
