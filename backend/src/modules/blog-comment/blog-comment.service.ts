import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BlogComment,
  BlogCommentDocument,
} from './schemas/blog-comment.schema';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { UpdateBlogCommentDto } from './dto/update-blog-comment.dto';

@Injectable()
export class BlogCommentService {
  constructor(
    @InjectModel(BlogComment.name)
    private blogCommentModel: Model<BlogCommentDocument>,
  ) {}

  async create(dto: CreateBlogCommentDto) {
    return this.blogCommentModel.create(dto);
  }

  async findAll(post?: string) {
    const filter = post ? { post } : {};
    return this.blogCommentModel.find(filter).populate('user', 'name');
  }

  async findOne(id: string) {
    return this.blogCommentModel.findById(id).populate(['user', 'post']);
  }

  async update(id: string, dto: UpdateBlogCommentDto) {
    return this.blogCommentModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.blogCommentModel.findByIdAndDelete(id);
  }
}
