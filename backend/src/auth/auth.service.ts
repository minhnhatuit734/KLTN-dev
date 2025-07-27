import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: any }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại.');
    }

    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Sai mật khẩu.');
    }

    const userObj = user.toObject
      ? user.toObject()
      : ({ ...user } as { [key: string]: any; password?: string });
    delete userObj.password;

    const payload = { sub: user._id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userObj,
    };
  }

  async forgotPassword(email: string, name: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy email.');
    }
    if (user.name !== name) {
      throw new UnauthorizedException('Tên không khớp với tài khoản.');
    }

    const newPass = '123456';
    const hashed = await bcrypt.hash(newPass, 10);

    await this.usersService.updatePassword(user.name, hashed);

    return 'success';
  }
}
