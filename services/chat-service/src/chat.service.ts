import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat.schema';
import { CreateChatMessageDto } from './dto/chat.dto';
import Together from 'together-ai';

@Injectable()
export class ChatService {
  private togetherClient = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  constructor(
    @InjectModel(ChatMessage.name)
    private chatModel: Model<ChatMessageDocument>,
  ) {}

  async sendMessage(dto: CreateChatMessageDto) {
    return this.chatModel.create(dto);
  }

  async getConversation(userId1: string, userId2: string) {
    return this.chatModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .sort({ createdAt: 1 });
  }

  async getUserChats(userId: string) {
    return this.chatModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
  }

  async getUnreadMessages(userId: string) {
    return this.chatModel.find({
      receiverId: userId,
      isRead: false,
    });
  }

  async markAsRead(messageId: string) {
    return this.chatModel.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true },
    );
  }

  async deleteMessage(messageId: string) {
    return this.chatModel.findByIdAndDelete(messageId);
  }

  async askTogether(
    messages: Array<{
      role: 'user' | 'system' | 'assistant' | 'tool';
      content: string;
    }>,
    model?: string,
  ) {
    return this.togetherClient.chat.completions.create({
      model: model || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages,
      stream: false,
    });
  }
}
