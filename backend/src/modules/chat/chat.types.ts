export interface TogetherMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TogetherResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
  [key: string]: any;
}
