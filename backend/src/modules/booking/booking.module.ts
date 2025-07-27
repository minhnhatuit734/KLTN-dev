import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingSchema } from './schemas/booking.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Booking', schema: BookingSchema }]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
