import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreateBookingDto) {
    return this.bookingModel.create({
      ...dto,
      bookingDate: new Date(),
    });
  }

  async findAll() {
    return this.bookingModel.find();
  }

  async findOne(id: string) {
    return this.bookingModel.findById(id);
  }

  async findByUserId(userId: string) {
    return this.bookingModel.find({ userId });
  }

  async update(id: string, dto: UpdateBookingDto) {
    return this.bookingModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.bookingModel.findByIdAndDelete(id);
  }

  async cancel(id: string) {
    return this.bookingModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );
  }
}
