import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogComment, BlogPostDocument, BlogCommentDocument } from './schemas/blog.schema';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateBlogCommentDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name) private blogModel: Model<BlogPostDocument>,
    @InjectModel(BlogComment.name) private commentModel: Model<BlogCommentDocument>,
  ) {}

  // Blog Posts
  async createPost(dto: CreateBlogPostDto) {
    return this.blogModel.create(dto);
  }

  async findAllPosts() {
    return this.blogModel.find().sort({ createdAt: -1 });
  }

  async findPost(id: string) {
    await this.blogModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
    return this.blogModel.findById(id);
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    return this.blogModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async deletePost(id: string) {
    await this.commentModel.deleteMany({ postId: id });
    return this.blogModel.findByIdAndDelete(id);
  }

  // Comments
  async createComment(dto: CreateBlogCommentDto) {
    return this.commentModel.create(dto);
  }

  async findPostComments(postId: string) {
    return this.commentModel.find({ postId }).sort({ createdAt: -1 });
  }

  async deleteComment(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}
