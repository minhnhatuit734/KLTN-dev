import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;

  @IsString()
  message: string;
}

export class UpdateChatMessageDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
