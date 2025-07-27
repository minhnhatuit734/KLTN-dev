import { Injectable } from '@nestjs/common';
import Together from 'together-ai';
import type { Together as TogetherTypes } from 'together-ai';

@Injectable()
export class ChatService {
  private client = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  async askTogether(
    messages: TogetherTypes.Chat.Completions.CompletionCreateParams['messages'],
    model = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  ): Promise<TogetherTypes.Chat.ChatCompletion> {
    const resp = await this.client.chat.completions.create({
      model,
      messages,
      stream: false,
    });
    return resp;
  }
}
