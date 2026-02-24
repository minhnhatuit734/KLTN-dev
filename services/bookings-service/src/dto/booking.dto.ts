import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsString()
  tourId: string;

  @IsOptional()
  @IsNumber()
  numberOfGuests?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsNumber()
  numberOfGuests?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status?: string;
}
