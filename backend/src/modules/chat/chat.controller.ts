/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Together as TogetherTypes } from 'together-ai';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body()
    body: {
      messages: TogetherTypes.Chat.Completions.CompletionCreateParams['messages'];
      model?: string;
    },
  ): Promise<TogetherTypes.Chat.ChatCompletion> {
    try {
      const resp = await this.chatService.askTogether(
        body.messages,
        body.model,
      );
      return resp;
    } catch (err: any) {
      throw new HttpException(
        err.message || 'Error from Together AI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
