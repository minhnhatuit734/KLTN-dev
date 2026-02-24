import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogPost, BlogPostSchema, BlogComment, BlogCommentSchema } from './schemas/blog.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService): Promise<MongooseModuleFactoryOptions> => ({
        uri: cfg.get<string>('MONGO_URL'),
      }),
    }),
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: BlogComment.name, schema: BlogCommentSchema },
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
