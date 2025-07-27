import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // Tạo mới tour
  @Post()
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  // Lấy danh sách tour, filter nếu có query
  @Get()
  findAll(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('guests') guests?: string,
  ) {
    return this.toursService.findTours(
      start_date,
      end_date,
      guests ? Number(guests) : undefined,
    );
  }

  // Lấy thông tin tour theo id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  // Update thông tin tour
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.toursService.update(id, updateTourDto);
  }

  // Xóa tour
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }

  // Upload/Update ảnh tour
  @Post('/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/images-tour',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files allowed!'), false);
        }
      },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    // Return absolute url for client
    const imageUrl = `${process.env.HOST_URL || 'http://travel-backend.local'}/uploads/images-tour/${file.filename}`;
    const updated = await this.toursService.update(id, { image: imageUrl });
    return { url: imageUrl, ...updated };
  }
}
