import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(dto: CreateReviewDto) {
    return this.reviewModel.create(dto);
  }

  async findAll(tour?: string) {
    const filter = tour ? { tour } : {};
    return this.reviewModel.find(filter).populate('user', 'name');
  }

  async findOne(id: string) {
    return this.reviewModel.findById(id).populate(['user', 'tour']);
  }

  async update(id: string, dto: UpdateReviewDto) {
    return this.reviewModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.reviewModel.findByIdAndDelete(id);
  }

  async removeByTour(tourId: string) {
    return this.reviewModel.deleteMany({ tour: tourId });
  }
}
