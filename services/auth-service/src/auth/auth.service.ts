import { Injectable, UnauthorizedException, HttpException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private usersServiceUrl = process.env.USERS_SERVICE_URL || 'http://localhost:3001';

  constructor(private jwtService: JwtService) {}

  async signIn(loginDto: LoginDto) {
    try {
      const user = await axios.get(
        `${this.usersServiceUrl}/users/email/${loginDto.email}`,
      );

      if (!user.data) {
        throw new UnauthorizedException('Tài khoản không tồn tại.');
      }

      const passwordMatch = await bcrypt.compare(loginDto.password, user.data.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Sai mật khẩu.');
      }

      const { password, ...userWithoutPassword } = user.data;
      const payload = { sub: user.data._id, email: user.data.email };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new UnauthorizedException('Đăng nhập thất bại.');
    }
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu không khớp.');
    }

    try {
      const user = await axios.post(`${this.usersServiceUrl}/users`, {
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
      });

      const payload = { sub: user.data._id, email: user.data.email };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: user.data,
      };
    } catch (error) {
      throw new HttpException('Đăng ký thất bại.', 400);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await axios.get(
        `${this.usersServiceUrl}/users/email/${forgotPasswordDto.email}`,
      );

      if (!user.data) {
        throw new UnauthorizedException('Không tìm thấy email.');
      }

      if (user.data.name !== forgotPasswordDto.name) {
        throw new UnauthorizedException('Tên không khớp với tài khoản.');
      }

      const newPass = '123456';
      const hashed = await bcrypt.hash(newPass, 10);

      await axios.patch(`${this.usersServiceUrl}/users/${user.data._id}`, {
        password: hashed,
      });

      return { success: true, message: 'Mật khẩu đã được reset.' };
    } catch (error) {
      throw new UnauthorizedException('Quên mật khẩu thất bại.');
    }
  }
}
