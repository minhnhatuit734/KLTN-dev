import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotDto } from './dto/forgot.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // LOGIN LOGS
    console.log('👉 Login body:', loginDto);

    // check mail
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email và mật khẩu không được bỏ trống');
    }

    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot')
  async forgot(@Body() forgotDto: ForgotDto) {
    // log forgot
    console.log('👉 Forgot body:', forgotDto);

    // check mail
    if (!forgotDto.email || !forgotDto.name) {
      throw new BadRequestException('Email và tên không được bỏ trống');
    }

    return this.authService.forgotPassword(forgotDto.email, forgotDto.name);
  }
}
