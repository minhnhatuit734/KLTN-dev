import { NestFactory } from '@nestjs/core';
import { ToursModule } from './tours.module';

async function bootstrap() {
  const app = await NestFactory.create(ToursModule);
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Tours Service running on port ${port}`);
}

bootstrap();
