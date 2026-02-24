import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserSchema } from './src/schemas/user.schema';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_users?authSource=admin';

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
      phone: '123456789',
    });

    const user1 = await UserModel.create({
      name: 'John Doe',
      email: 'user1@example.com',
      password: await hashPassword('1234'),
      role: 'user',
      phone: '0987654321',
    });

    const user2 = await UserModel.create({
      name: 'Jane Smith',
      email: 'user2@example.com',
      password: await hashPassword('12345'),
      role: 'user',
      phone: '0912345678',
    });

    console.log('✅ Users seeded successfully!');
    console.log('Users created:', [admin._id, user1._id, user2._id]);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
