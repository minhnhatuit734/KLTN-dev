import { NestFactory } from '@nestjs/core';
import { ReviewsModule } from './reviews.module';

async function bootstrap() {
  const app = await NestFactory.create(ReviewsModule);
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Reviews Service running on port ${port}`);
}

bootstrap();
