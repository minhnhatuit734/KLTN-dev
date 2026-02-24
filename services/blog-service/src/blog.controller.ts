import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateBlogCommentDto } from './dto/blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('posts')
  createPost(@Body() dto: CreateBlogPostDto) {
    return this.blogService.createPost(dto);
  }

  @Post('posts/image')
  uploadImage() {
    return { url: '/images/default_blog.jpg' };
  }

  @Get('posts')
  findAllPosts() {
    return this.blogService.findAllPosts();
  }

  @Get('posts/:id')
  findPost(@Param('id') id: string) {
    return this.blogService.findPost(id);
  }

  @Patch('posts/:id')
  updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  @Post('comments')
  createComment(@Body() dto: CreateBlogCommentDto) {
    return this.blogService.createComment(dto);
  }

  @Get('posts/:postId/comments')
  findPostComments(@Param('postId') postId: string) {
    return this.blogService.findPostComments(postId);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
  }
}
