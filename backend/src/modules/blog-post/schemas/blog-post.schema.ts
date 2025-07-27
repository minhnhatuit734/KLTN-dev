import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type BlogPostDocument = HydratedDocument<BlogPost>;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  author: mongoose.Types.ObjectId;
  @Prop({ required: true }) title: string;
  @Prop() image: string;
  @Prop({ required: true }) content: string;
}
export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
