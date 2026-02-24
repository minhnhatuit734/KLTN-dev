import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogPostDocument = HydratedDocument<BlogPost>;
export type BlogCommentDocument = HydratedDocument<BlogComment>;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ required: true })
  authorId: string;

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  views?: number;

  @Prop([String])
  tags?: string[];
}

@Schema({ timestamps: true })
export class BlogComment {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  content: string;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
export const BlogCommentSchema = SchemaFactory.createForClass(BlogComment);
