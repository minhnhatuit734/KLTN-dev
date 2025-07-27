import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async create(dto: CreateBookingDto) {
    return this.bookingModel.create(dto);
  }

  // Admin: lấy tất cả booking
  async findAll() {
    return this.bookingModel.find().populate(['user', 'tour']);
  }

  // User: lấy booking theo userId
  async findByUser(userId: string) {
    return this.bookingModel.find({ user: userId }).populate(['user', 'tour']);
  }

  async findOne(id: string) {
    return this.bookingModel.findById(id).populate(['user', 'tour']);
  }

  async update(id: string, dto: UpdateBookingDto) {
    return this.bookingModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.bookingModel.findByIdAndDelete(id);
  }
}
