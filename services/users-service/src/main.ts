import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Users Service running on port ${port}`);
}

bootstrap();
