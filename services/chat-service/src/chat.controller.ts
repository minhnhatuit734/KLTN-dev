import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async askAI(
    @Body()
    body: {
      messages: Array<{
        role: 'user' | 'system' | 'assistant' | 'tool';
        content: string;
      }>;
      model?: string;
    },
  ) {
    try {
      return await this.chatService.askTogether(body.messages || [], body.model);
    } catch (err: any) {
      throw new HttpException(
        err?.message || 'Error from Together AI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send')
  sendMessage(@Body() dto: CreateChatMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Get('conversation')
  getConversation(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
  ) {
    return this.chatService.getConversation(userId1, userId2);
  }

  @Get('chats/:userId')
  getUserChats(@Param('userId') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Get('unread/:userId')
  getUnreadMessages(@Param('userId') userId: string) {
    return this.chatService.getUnreadMessages(userId);
  }

  @Patch('messages/:messageId/read')
  markAsRead(@Param('messageId') messageId: string) {
    return this.chatService.markAsRead(messageId);
  }

  @Delete('messages/:messageId')
  deleteMessage(@Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(messageId);
  }
}
