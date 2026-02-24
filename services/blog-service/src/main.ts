import { NestFactory } from '@nestjs/core';
import { BlogModule } from './blog.module';

async function bootstrap() {
  const app = await NestFactory.create(BlogModule);
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Blog Service running on port ${port}`);
}

bootstrap();
