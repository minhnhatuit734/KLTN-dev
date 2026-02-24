import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Chat Service running on port ${port}`);
}

bootstrap();
