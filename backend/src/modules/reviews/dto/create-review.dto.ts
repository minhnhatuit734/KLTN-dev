import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  user: string;

  @IsString()
  tour: string;

  @IsString()
  content: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
