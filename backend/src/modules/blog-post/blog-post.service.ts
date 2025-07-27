import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from './schemas/blog-post.schema';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogPostService {
  constructor(
    @InjectModel(BlogPost.name) private blogPostModel: Model<BlogPostDocument>,
  ) {}

  async create(dto: CreateBlogPostDto) {
    return this.blogPostModel.create(dto);
  }

  async findAll() {
    return this.blogPostModel.find().populate('author');
  }

  async findOne(id: string) {
    return this.blogPostModel.findById(id).populate('author');
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    return this.blogPostModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string) {
    return this.blogPostModel.findByIdAndDelete(id);
  }
}
