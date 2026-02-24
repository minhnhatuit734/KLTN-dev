import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(dto: CreateReviewDto) {
    return this.reviewModel.create(dto);
  }

  async findAll() {
    return this.reviewModel.find().sort({ createdAt: -1 });
  }

  async findByTourId(tourId: string) {
    return this.reviewModel.find({ tourId }).sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    return this.reviewModel.findById(id);
  }

  async update(id: string, dto: UpdateReviewDto) {
    return this.reviewModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.reviewModel.findByIdAndDelete(id);
  }

  async getAverageRating(tourId: string) {
    const result = await this.reviewModel.aggregate([
      { $match: { tourId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  }
}
