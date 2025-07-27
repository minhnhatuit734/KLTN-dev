import { Module } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogPostController } from './blog-post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
    ]),
  ],
  controllers: [BlogPostController],
  providers: [BlogPostService],
})
export class BlogPostModule {}
