import { IsString, IsOptional } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  author: string;

  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsString()
  content: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
