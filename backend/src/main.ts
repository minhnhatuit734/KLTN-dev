import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as process from 'process';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  console.log('Serving static:', join(process.cwd(), 'uploads'));
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://107.22.60.96:3000',
      'http://travel-frontend.local',
      'http://127.0.0.1:5500',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(configService.get('PORT') ?? 5000);
}
bootstrap();
