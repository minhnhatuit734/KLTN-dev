import { NestFactory } from '@nestjs/core';
import { AuthModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Auth Service running on port ${port}`);
}

bootstrap();
