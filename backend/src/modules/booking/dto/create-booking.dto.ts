import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  user: string;

  @IsString()
  tour: string;

  @IsNumber()
  num_people: number;

  @IsNumber()
  total_price: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
