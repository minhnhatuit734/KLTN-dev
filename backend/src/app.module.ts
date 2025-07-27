import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ToursModule } from './modules/tours/tours.module';
import { BookingModule } from './modules/booking/booking.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BlogPostModule } from './modules/blog-post/blog-post.module';
import { BlogCommentModule } from './modules/blog-comment/blog-comment.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        uri: cfg.get<string>('MONGO_URL'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    UsersModule,
    ToursModule,
    BookingModule,
    ReviewsModule,
    BlogPostModule,
    BlogCommentModule,
    AuthModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
