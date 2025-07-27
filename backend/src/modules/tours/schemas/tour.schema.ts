import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type TourDocument = HydratedDocument<Tour>;

@Schema({ timestamps: true })
export class Tour {
  @Prop() id: number;
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({}) location: string;
  @Prop({}) price: number;
  @Prop({}) start_date: Date;
  @Prop({}) end_date: Date;
  @Prop({ default: 0 }) traveler?: number;
  @Prop({ default: 0 }) capacity?: number;
  @Prop({}) image?: string;
}
export const TourSchema = SchemaFactory.createForClass(Tour);
