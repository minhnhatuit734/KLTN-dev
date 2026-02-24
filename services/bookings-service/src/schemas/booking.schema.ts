import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  tourId: string;

  @Prop({ default: 1 })
  numberOfGuests: number;

  @Prop()
  totalPrice: number;

  @Prop({ enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop()
  bookingDate: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
