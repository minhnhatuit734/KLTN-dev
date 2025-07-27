import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { BlogPost } from '../../blog-post/schemas/blog-post.schema';
export type BlogCommentDocument = HydratedDocument<BlogComment>;

@Schema({ timestamps: true })
export class BlogComment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: mongoose.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: BlogPost.name,
    required: true,
  })
  post: mongoose.Types.ObjectId;
  @Prop({ required: true }) comment: string;
}
export const BlogCommentSchema = SchemaFactory.createForClass(BlogComment);
