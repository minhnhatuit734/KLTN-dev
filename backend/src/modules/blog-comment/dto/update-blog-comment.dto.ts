import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogCommentDto } from './create-blog-comment.dto';

export class UpdateBlogCommentDto extends PartialType(CreateBlogCommentDto) {}
