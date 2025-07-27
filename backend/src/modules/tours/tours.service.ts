/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(@InjectModel(Tour.name) private tourModel: Model<TourDocument>) {}

  async create(dto: CreateTourDto) {
    return this.tourModel.create(dto);
  }

  async findTours(start_date?: string, end_date?: string, guests?: number) {
    const query: any = {};

    if (start_date && end_date) {
      query.start_date = { $lte: new Date(end_date) };
      query.end_date = { $gte: new Date(start_date) };
    }

    if (guests !== undefined) {
      query.$expr = {
        $gte: [
          { $subtract: ['$capacity', { $ifNull: ['$traveler', 0] }] },
          guests,
        ],
      };
    }
    return this.tourModel.find(query);
  }

  async findAll() {
    return this.tourModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    return this.tourModel.findById(id);
  }

  async update(id: string, dto: UpdateTourDto) {
    return this.tourModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.tourModel.findByIdAndDelete(id);
  }
}
