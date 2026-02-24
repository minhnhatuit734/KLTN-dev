import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class CreateBlogCommentDto {
  @IsString()
  postId: string;

  @IsString()
  userId: string;

  @IsString()
  content: string;
}
