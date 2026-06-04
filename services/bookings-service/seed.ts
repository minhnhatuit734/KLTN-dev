require('dotenv').config({ path: '../../.env' });
import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_ATLAS_URI ? `${process.env.MONGO_ATLAS_URI}/tour_bookings` : 'mongodb://admin:password@mongodb:27017/tour_bookings?authSource=admin';

const BookingSchema = new mongoose.Schema({
  user_id: String,
  tour_id: String,
  booking_date: Date,
  start_date: Date,
  end_date: Date,
  number_of_people: Number,
  total_price: Number,
  status: String,
  special_requests: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const seedData = [
  {
    user_id: '1',
    tour_id: '1',
    booking_date: new Date('2025-08-01'),
    start_date: new Date('2025-09-01'),
    end_date: new Date('2025-09-05'),
    number_of_people: 2,
    total_price: 1040,
    status: 'confirmed',
    special_requests: 'Need vegetarian meals'
  },
  {
    user_id: '2',
    tour_id: '2',
    booking_date: new Date('2025-08-05'),
    start_date: new Date('2025-09-10'),
    end_date: new Date('2025-09-13'),
    number_of_people: 3,
    total_price: 720,
    status: 'confirmed',
    special_requests: 'Family with young children'
  },
  {
    user_id: '3',
    tour_id: '3',
    booking_date: new Date('2025-08-10'),
    start_date: new Date('2025-10-01'),
    end_date: new Date('2025-10-06'),
    number_of_people: 1,
    total_price: 650,
    status: 'pending',
    special_requests: 'Solo traveler'
  },
  {
    user_id: '1',
    tour_id: '4',
    booking_date: new Date('2025-08-08'),
    start_date: new Date('2025-10-15'),
    end_date: new Date('2025-10-18'),
    number_of_people: 4,
    total_price: 1680,
    status: 'confirmed',
    special_requests: 'Group tour'
  },
  {
    user_id: '4',
    tour_id: '5',
    booking_date: new Date('2025-08-12'),
    start_date: new Date('2025-11-01'),
    end_date: new Date('2025-11-04'),
    number_of_people: 2,
    total_price: 760,
    status: 'confirmed',
    special_requests: 'Honeymoon package'
  },
  {
    user_id: '5',
    tour_id: '6',
    booking_date: new Date('2025-08-15'),
    start_date: new Date('2025-11-10'),
    end_date: new Date('2025-11-12'),
    number_of_people: 3,
    total_price: 840,
    status: 'confirmed',
    special_requests: 'Adventure seekers'
  },
  {
    user_id: '2',
    tour_id: '7',
    booking_date: new Date('2025-08-18'),
    start_date: new Date('2025-11-01'),
    end_date: new Date('2025-11-05'),
    number_of_people: 1,
    total_price: 340,
    status: 'completed',
    special_requests: 'Photography enthusiast'
  },
  {
    user_id: '6',
    tour_id: '8',
    booking_date: new Date('2025-08-20'),
    start_date: new Date('2025-12-01'),
    end_date: new Date('2025-12-05'),
    number_of_people: 2,
    total_price: 960,
    status: 'confirmed',
    special_requests: 'Luxury experience'
  },
  {
    user_id: '3',
    tour_id: '9',
    booking_date: new Date('2025-08-22'),
    start_date: new Date('2025-12-01'),
    end_date: new Date('2025-12-05'),
    number_of_people: 3,
    total_price: 1350,
    status: 'pending',
    special_requests: 'Snorkeling experience'
  },
  {
    user_id: '7',
    tour_id: '10',
    booking_date: new Date('2025-08-25'),
    start_date: new Date('2025-12-10'),
    end_date: new Date('2025-12-12'),
    number_of_people: 2,
    total_price: 640,
    status: 'confirmed',
    special_requests: 'Beach relaxation'
  },
  {
    user_id: '4',
    tour_id: '11',
    booking_date: new Date('2025-08-28'),
    start_date: new Date('2025-12-15'),
    end_date: new Date('2025-12-18'),
    number_of_people: 1,
    total_price: 310,
    status: 'confirmed',
    special_requests: 'Cultural exploration'
  },
  {
    user_id: '5',
    tour_id: '12',
    booking_date: new Date('2025-09-01'),
    start_date: new Date('2025-09-15'),
    end_date: new Date('2025-09-19'),
    number_of_people: 4,
    total_price: 2080,
    status: 'pending',
    special_requests: 'Trekking group'
  },
  {
    user_id: '1',
    tour_id: '13',
    booking_date: new Date('2025-09-03'),
    start_date: new Date('2025-10-01'),
    end_date: new Date('2025-10-05'),
    number_of_people: 2,
    total_price: 960,
    status: 'confirmed',
    special_requests: 'Mountain trekking'
  },
  {
    user_id: '6',
    tour_id: '14',
    booking_date: new Date('2025-09-05'),
    start_date: new Date('2025-10-20'),
    end_date: new Date('2025-10-23'),
    number_of_people: 2,
    total_price: 680,
    status: 'completed',
    special_requests: 'Romantic getaway'
  },
  {
    user_id: '7',
    tour_id: '15',
    booking_date: new Date('2025-09-08'),
    start_date: new Date('2025-11-15'),
    end_date: new Date('2025-11-18'),
    number_of_people: 3,
    total_price: 1140,
    status: 'confirmed',
    special_requests: 'Photography tour'
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB for bookings seeding');

    const Booking = mongoose.model('Booking', BookingSchema);

    // Clear existing data
    await Booking.deleteMany({});
    console.log('🗑️ Cleared existing bookings');

    // Insert seed data
    await Booking.insertMany(seedData);
    console.log('✅ Bookings seeded successfully!');
    console.log(`📊 Inserted ${seedData.length} bookings`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
