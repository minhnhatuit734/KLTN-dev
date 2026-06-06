import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat.schema';
import { CreateChatMessageDto } from './dto/chat.dto';
import Together from 'together-ai';
import axios from 'axios';

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

  async askRasa(message: string, sender: string = 'user') {
    const rasaServerUrl = process.env.RASA_SERVER_URL || 'http://rasa-server-service:5005';
    const rasaWebhookUrl = process.env.RASA_WEBHOOK_URL || `${rasaServerUrl}/webhooks/rest/webhook`;
    
    try {
      const response = await axios.post(
        rasaWebhookUrl,
        {
          sender,
          message,
        },
        {
          timeout: 30000,
        },
      );

      const data = response.data;
      if (!Array.isArray(data)) {
        console.error('Rasa returned invalid format:', data);
        return [{ text: 'Lỗi: Bot AI trả về dữ liệu không hợp lệ.' }];
      }

      if (data.length === 0) {
        return [{ text: 'Bot AI không có câu trả lời cho bạn lúc này.' }];
      }

      const normalized = data.map((item: any) => {
        if (item.text) {
          return { text: item.text };
        } else if (item.image) {
          return { text: `[Hình ảnh] ${item.image}` };
        } else {
          return { text: '...' };
        }
      });

      return normalized;
    } catch (error: any) {
      const isTimeout = error.code === 'ECONNABORTED';
      const isConnRefused = error.code === 'ECONNREFUSED';
      
      console.error(`[ChatService] askRasa error: ${error.message} - Code: ${error.code}`);
      
      if (isTimeout) {
        throw new Error('Kết nối tới Bot AI bị quá hạn (Timeout 30s).');
      }
      if (isConnRefused) {
        throw new Error('Bot AI hiện đang bảo trì hoặc không thể kết nối.');
      }
      
      throw new Error('Có lỗi xảy ra khi gọi Bot AI.');
    }
  }
}
