import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BlogCommentService } from './blog-comment.service';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { UpdateBlogCommentDto } from './dto/update-blog-comment.dto';
@Controller('blog-comment')
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Post()
  create(@Body() createBlogCommentDto: CreateBlogCommentDto) {
    return this.blogCommentService.create(createBlogCommentDto);
  }

  @Get()
  findAll(@Query('post') post?: string) {
    return this.blogCommentService.findAll(post);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogCommentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogCommentDto: UpdateBlogCommentDto,
  ) {
    return this.blogCommentService.update(id, updateBlogCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogCommentService.remove(id);
  }
}
