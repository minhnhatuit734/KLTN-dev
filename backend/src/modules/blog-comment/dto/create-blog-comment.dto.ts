import { IsString, IsOptional } from 'class-validator';

export class CreateBlogCommentDto {
  @IsString()
  user: string;

  @IsString()
  post: string;

  @IsString()
  comment: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
