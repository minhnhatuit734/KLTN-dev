import * as mongoose from 'mongoose';
import { Tour, TourSchema } from './src/schemas/tour.schema';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_tours?authSource=admin';

const adminId = '507f1f77bcf86cd799439011'; // Placeholder ID

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const TourModel = mongoose.model<any>('Tour', TourSchema);

    // Clear existing tours
    await TourModel.deleteMany({});
    console.log('Cleared existing tours');

    const toursData = [
      {
        organizer: adminId,
        title: 'Tour to Ha Long Bay',
        description: 'Ha Long Bay is a UNESCO World Heritage site',
        location: 'Ha Long Bay, Vietnam',
        price: 350,
        start_date: new Date('2025-09-01'),
        end_date: new Date('2025-09-05'),
        capacity: 25,
        image: 'https://songhongtourist.vn/upload/2022-12-05/z3934569882341_2da32452683b00f72cdd01e67ff588e4-5.jpg',
      },
      {
        organizer: adminId,
        title: 'Tour to Phu Quoc',
        description: 'A beautiful island in Vietnam.',
        location: 'Phu Quoc, Vietnam',
        price: 400,
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-05'),
        capacity: 30,
        image: 'https://vietnam.travel/sites/default/files/2022-10/shutterstock_1660147075.jpg',
      },
      {
        organizer: adminId,
        title: 'Tour to Hue',
        description: 'Explore the ancient city of Hue.',
        location: 'Hue, Vietnam',
        price: 250,
        start_date: new Date('2025-11-01'),
        end_date: new Date('2025-11-05'),
        capacity: 18,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg/500px-Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg',
      },
      {
        organizer: adminId,
        title: 'Tour to Nha Trang',
        description: 'Relax on the beautiful beaches of Nha Trang.',
        location: 'Nha Trang, Vietnam',
        price: 350,
        start_date: new Date('2025-12-01'),
        end_date: new Date('2025-12-05'),
        capacity: 30,
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/0c/b4/e3/infinity-swimming-pool.jpg?w=1400&h=-1&s=1',
      },
      {
        organizer: adminId,
        title: 'Tour to Ho Chi Minh City',
        description: 'The bustling city of Ho Chi Minh.',
        location: 'Ho Chi Minh City, Vietnam',
        price: 150,
        start_date: new Date('2025-12-10'),
        end_date: new Date('2025-12-12'),
        capacity: 20,
        image: 'https://mettavoyage.com/wp-content/uploads/2023/07/Ho-Chi-Minh-City-3.jpg',
      },
      {
        organizer: adminId,
        title: 'Tour to Mekong Delta',
        description: 'Explore the peaceful Mekong Delta.',
        location: 'Mekong Delta, Vietnam',
        price: 200,
        start_date: new Date('2025-12-15'),
        end_date: new Date('2025-12-18'),
        capacity: 25,
        image: 'https://tse4.mm.bing.net/th/id/OIP.Dw5-ToTDO-t57D1KIgI7bgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      },
    ];

    await TourModel.insertMany(toursData);
    console.log('✅ Tours seeded successfully!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
