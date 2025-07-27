import { Module } from '@nestjs/common';
import { BlogCommentService } from './blog-comment.service';
import { BlogCommentController } from './blog-comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogComment, BlogCommentSchema } from './schemas/blog-comment.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogComment.name, schema: BlogCommentSchema },
    ]),
  ],
  controllers: [BlogCommentController],
  providers: [BlogCommentService],
})
export class BlogCommentModule {}
