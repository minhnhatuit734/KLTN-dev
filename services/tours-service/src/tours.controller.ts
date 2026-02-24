import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  @Get('search')
  searchTours(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('guests') guests?: string,
  ) {
    const guestCount = guests ? Number.parseInt(guests, 10) : undefined;
    return this.toursService.findTours(start_date, end_date, guestCount);
  }

  @Post('image')
  uploadImage() {
    return { url: '/images/default_tour.jpg' };
  }

  @Get()
  findAll() {
    return this.toursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
