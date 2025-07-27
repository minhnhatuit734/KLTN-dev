// src/modules/tours/dto/create-tour.dto.ts
import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateTourDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsDate()
  @IsOptional()
  start_date?: Date;

  @IsDate()
  @IsOptional()
  end_date?: Date;

  @IsString()
  @IsOptional()
  traveler?: number;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
