import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  findAll() {
    return this.userModel.find().select('-password');
  }

  findOne(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password');
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(name: string) {
    return this.userModel.findOne({ name }).exec();
  }

  async updatePassword(userId: string, newHashedPassword: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: newHashedPassword } },
    );
  }

  updateAvatar(id: string, avatar?: string) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { avatar: avatar || '/images/default-avatar.jpg' },
        { new: true },
      )
      .select('-password');
  }
}
