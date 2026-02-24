import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_bookings?authSource=admin';

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
    booking_date: new Date('2024-01-15'),
    start_date: new Date('2024-02-20'),
    end_date: new Date('2024-02-25'),
    number_of_people: 2,
    total_price: 700,
    status: 'confirmed',
    special_requests: 'Need vegetarian meals'
  },
  {
    user_id: '2',
    tour_id: '2',
    booking_date: new Date('2024-01-10'),
    start_date: new Date('2024-03-01'),
    end_date: new Date('2024-03-05'),
    number_of_people: 3,
    total_price: 1200,
    status: 'confirmed',
    special_requests: 'Family with young children'
  },
  {
    user_id: '1',
    tour_id: '3',
    booking_date: new Date('2024-01-20'),
    start_date: new Date('2024-03-10'),
    end_date: new Date('2024-03-12'),
    number_of_people: 1,
    total_price: 250,
    status: 'pending',
    special_requests: 'Solo traveler'
  },
  {
    user_id: '3',
    tour_id: '4',
    booking_date: new Date('2024-01-18'),
    start_date: new Date('2024-02-28'),
    end_date: new Date('2024-03-03'),
    number_of_people: 2,
    total_price: 700,
    status: 'confirmed',
    special_requests: 'Honeymoon package'
  },
  {
    user_id: '2',
    tour_id: '5',
    booking_date: new Date('2024-01-22'),
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-04-02'),
    number_of_people: 4,
    total_price: 600,
    status: 'confirmed',
    special_requests: 'Group tour'
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
