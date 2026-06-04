require('dotenv').config({ path: '../../.env' });
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from './src/schemas/user.schema';

const mongoUrl = process.env.MONGO_ATLAS_URI ? `${process.env.MONGO_ATLAS_URI}/tour_users` : 'mongodb://admin:password@mongodb:27017/tour_users?authSource=admin';

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const UserModel = mongoose.model<any>('User', UserSchema);

    // Clear existing users
    await UserModel.deleteMany({});
    console.log('Cleared existing users');

    // Hash password function
    const hashPassword = async (plain: string) => await bcrypt.hash(plain, 10);

    // Create users
    const admin = await UserModel.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hashPassword('123'),
      role: 'admin',
      phone: '0900000001',
    });

    const user1 = await UserModel.create({
      name: 'Nguyen Van A',
      email: 'user1@example.com',
      password: await hashPassword('1234'),
      role: 'user',
      phone: '0900000002',
    });

    const user2 = await UserModel.create({
      name: 'Tran Thi B',
      email: 'user2@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000003',
    });

    const user3 = await UserModel.create({
      name: 'Le Van C',
      email: 'user3@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000004',
    });

    const user4 = await UserModel.create({
      name: 'Pham Thi D',
      email: 'user4@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000005',
    });

    const user5 = await UserModel.create({
      name: 'Hoang Van E',
      email: 'user5@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000006',
    });

    const user6 = await UserModel.create({
      name: 'Vu Thi F',
      email: 'user6@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000007',
    });

    const user7 = await UserModel.create({
      name: 'Do Van G',
      email: 'user7@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0900000008',
    });

    console.log('✅ Users seeded successfully!');
    console.log('Users created:', [admin._id, user1._id, user2._id, user3._id, user4._id, user5._id, user6._id, user7._id]);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
