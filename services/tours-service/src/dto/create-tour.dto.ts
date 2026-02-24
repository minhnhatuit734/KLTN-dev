import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateTourDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsDate()
  start_date?: Date;

  @IsOptional()
  @IsDate()
  end_date?: Date;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsString()
  image?: string;
}
