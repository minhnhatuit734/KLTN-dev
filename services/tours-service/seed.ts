require('dotenv').config({ path: '../../.env' });
import * as mongoose from 'mongoose';
import { Tour, TourSchema } from './src/schemas/tour.schema';

const mongoUrl = process.env.MONGO_ATLAS_URI ? `${process.env.MONGO_ATLAS_URI}/tour_tours` : 'mongodb://admin:password@mongodb:27017/tour_tours?authSource=admin';

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
        title: 'Ha Long Bay Luxury Cruise 3N2D',
        description: 'Explore UNESCO World Heritage site with 5-star cruise, kayaking in crystal clear waters, cave exploration with local guides, fresh seafood dining on boat',
        location: 'Ha Long Bay, Vietnam',
        price: 520,
        start_date: new Date('2025-09-01'),
        end_date: new Date('2025-09-05'),
        capacity: 25,
        image: 'https://songhongtourist.vn/upload/2022-12-05/z3934569882341_2da32452683b00f72cdd01e67ff588e4-5.jpg',
      },
      {
        organizer: adminId,
        title: 'Ha Long Bay Budget Adventure',
        description: 'Experience Ha Long Bay on budget, shared cabin cruise, visits to Surprise Cave and Titop Island',
        location: 'Ha Long Bay, Vietnam',
        price: 240,
        start_date: new Date('2025-09-10'),
        end_date: new Date('2025-09-13'),
        capacity: 30,
        image: 'https://songhongtourist.vn/upload/2022-12-05/z3934569882341_2da32452683b00f72cdd01e67ff588e4-5.jpg',
      },
      {
        organizer: adminId,
        title: 'Phu Quoc Island Paradise 5D4N',
        description: 'Island hopping, snorkeling at coral reefs, visit pearl farms, night market experience, fresh seafood, white sandy beaches',
        location: 'Phu Quoc, Vietnam',
        price: 650,
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-06'),
        capacity: 20,
        image: 'https://vietnam.travel/sites/default/files/2022-10/shutterstock_1660147075.jpg',
      },
      {
        organizer: adminId,
        title: 'Phu Quoc Beach Escape 3D2N',
        description: 'Relax on Sao Beach, water sports activities, sunset cruise, local island food tour',
        location: 'Phu Quoc, Vietnam',
        price: 420,
        start_date: new Date('2025-10-15'),
        end_date: new Date('2025-10-18'),
        capacity: 25,
        image: 'https://vietnam.travel/sites/default/files/2022-10/shutterstock_1660147075.jpg',
      },
      {
        organizer: adminId,
        title: 'Da Nang - Hoi An Ancient Town Combo',
        description: 'Da Nang city tour, Marble Mountains, My Khe Beach, walk through Hoi An lantern-lit streets, Traditional cooking class',
        location: 'Da Nang, Vietnam',
        price: 380,
        start_date: new Date('2025-11-01'),
        end_date: new Date('2025-11-04'),
        capacity: 22,
        image: 'https://images.unsplash.com/photo-1521866574940-ce89033f5b47?w=800',
      },
      {
        organizer: adminId,
        title: 'Da Nang Beach & Adventure',
        description: 'Da Nang beaches exploration, water sports at My Khe, Dragon Bridge night view, Han Market local food experience',
        location: 'Da Nang, Vietnam',
        price: 280,
        start_date: new Date('2025-11-10'),
        end_date: new Date('2025-11-12'),
        capacity: 28,
        image: 'https://images.unsplash.com/photo-1521866574940-ce89033f5b47?w=800',
      },
      {
        organizer: adminId,
        title: 'Hue Imperial City Heritage Tour',
        description: 'UNESCO heritage site exploration, Royal Palace and tombs, Huong River boat tour, traditional royal cuisine experience',
        location: 'Hue, Vietnam',
        price: 340,
        start_date: new Date('2025-11-01'),
        end_date: new Date('2025-11-05'),
        capacity: 18,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg/500px-Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg',
      },
      {
        organizer: adminId,
        title: 'Hue - Hoi An Connection 4D3N',
        description: 'Hue royal sites, transfer to Hoi An, old town exploration, cooking classes, beach relaxation',
        location: 'Hue, Vietnam',
        price: 480,
        start_date: new Date('2025-12-01'),
        end_date: new Date('2025-12-05'),
        capacity: 20,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg/500px-Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg',
      },
      {
        organizer: adminId,
        title: 'Nha Trang Beach Paradise 4D3N',
        description: 'Nha Trang beaches, island hopping (Mun, Mot, Ba islands), snorkeling at coral reefs, underwater museum visit',
        location: 'Nha Trang, Vietnam',
        price: 450,
        start_date: new Date('2025-12-01'),
        end_date: new Date('2025-12-05'),
        capacity: 24,
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/0c/b4/e3/infinity-swimming-pool.jpg?w=1400&h=-1&s=1',
      },
      {
        organizer: adminId,
        title: 'Nha Trang City & Sea Adventure',
        description: 'Nha Trang city tour, Po Nagar temple, Long Son Pagoda, seaside dining, night swimming',
        location: 'Nha Trang, Vietnam',
        price: 320,
        start_date: new Date('2025-12-10'),
        end_date: new Date('2025-12-12'),
        capacity: 28,
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/0c/b4/e3/infinity-swimming-pool.jpg?w=1400&h=-1&s=1',
      },
      {
        organizer: adminId,
        title: 'Mekong Delta Floating Markets 3D2N',
        description: 'Floating markets tour, coconut candy production, rice noodle making, local homestay experience, sunset river cruise',
        location: 'Mekong Delta, Vietnam',
        price: 310,
        start_date: new Date('2025-12-15'),
        end_date: new Date('2025-12-18'),
        capacity: 16,
        image: 'https://tse4.mm.bing.net/th/id/OIP.Dw5-ToTDO-t57D1KIgI7bgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        organizer: adminId,
        title: 'Sapa Mountain Trek & Villages 4D3N',
        description: 'Trek through rice terraces, visit ethnic minority villages (H\'Mong, Dzao), camping experience, local food tasting, sunrise hike',
        location: 'Sapa, Vietnam',
        price: 520,
        start_date: new Date('2025-09-15'),
        end_date: new Date('2025-09-19'),
        capacity: 15,
        image: 'https://images.unsplash.com/photo-1583286335622-e77dd55d7e16?w=800',
      },
      {
        organizer: adminId,
        title: 'Sapa Heaven Gate & Fansipan Summit',
        description: 'Fansipan mountain cable car experience, Heaven Gate photo spot, trekking through cloud forest, ethnic minority market visit',
        location: 'Sapa, Vietnam',
        price: 480,
        start_date: new Date('2025-10-01'),
        end_date: new Date('2025-10-05'),
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1583286335622-e77dd55d7e16?w=800',
      },
      {
        organizer: adminId,
        title: 'Da Lat Romantic Getaway 3D2N',
        description: 'Visit coffee plantations, Dalat Palace views, Love Valley exploration, Xuan Huong Lake, local flower market, French colonial architecture',
        location: 'Da Lat, Vietnam',
        price: 340,
        start_date: new Date('2025-10-20'),
        end_date: new Date('2025-10-23'),
        capacity: 20,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      },
      {
        organizer: adminId,
        title: 'Ninh Binh Karst Landscape 3D2N',
        description: 'Boat tour through Tam Coc karst valley, cave exploration, cycling through rice fields, Hang Mua climbing for panoramic views',
        location: 'Ninh Binh, Vietnam',
        price: 380,
        start_date: new Date('2025-11-15'),
        end_date: new Date('2025-11-18'),
        capacity: 22,
        image: 'https://images.unsplash.com/photo-1555881286-92c2d8e76af5?w=800',
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
