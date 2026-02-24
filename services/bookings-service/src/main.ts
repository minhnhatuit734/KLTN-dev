import { NestFactory } from '@nestjs/core';
import { BookingsModule } from './bookings.module';

async function bootstrap() {
  const app = await NestFactory.create(BookingsModule);
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Bookings Service running on port ${port}`);
}

bootstrap();
