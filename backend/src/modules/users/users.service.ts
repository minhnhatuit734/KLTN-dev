import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Tạo người dùng mới
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    return this.userModel.create(createUserDto);
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  // Xóa người dùng
  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  // Tìm người dùng theo email
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  // Tìm người dùng theo tên
  async findByUsername(name: string) {
    return await this.userModel.findOne({ name }).exec();
  }

  // Cập nhật mật khẩu cho người dùng
  async updatePassword(
    userId: string,
    newHashedPassword: string,
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId }, // Sử dụng _id thay vì name
      { $set: { password: newHashedPassword } },
    );
  }
}
