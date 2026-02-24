import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_reviews?authSource=admin';

const ReviewSchema = new mongoose.Schema({
  tour_id: String,
  user_id: String,
  rating: Number,
  comment: String,
  helpful_count: { type: Number, default: 0 },
  unhelpful_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const seedData = [
  {
    tour_id: '1',
    user_id: '1',
    rating: 5,
    comment: 'Amazing experience! Ha Long Bay tour was absolutely breathtaking. Great guides and excellent service.',
    helpful_count: 15,
    unhelpful_count: 0
  },
  {
    tour_id: '1',
    user_id: '2',
    rating: 4,
    comment: 'Beautiful scenery but a bit crowded. Food could have been better.',
    helpful_count: 8,
    unhelpful_count: 2
  },
  {
    tour_id: '2',
    user_id: '3',
    rating: 5,
    comment: 'Phu Quoc was the best vacation ever! Crystal clear waters and pristine beaches.',
    helpful_count: 22,
    unhelpful_count: 1
  },
  {
    tour_id: '3',
    user_id: '1',
    rating: 4,
    comment: 'Hue tour is historically rich. Good accommodation and friendly staff.',
    helpful_count: 10,
    unhelpful_count: 0
  },
  {
    tour_id: '4',
    user_id: '2',
    rating: 5,
    comment: 'Nha Trang exceeded all expectations! Perfect beach getaway with water activities.',
    helpful_count: 18,
    unhelpful_count: 0
  },
  {
    tour_id: '5',
    user_id: '3',
    rating: 3,
    comment: 'Ho Chi Minh City tour was informative but quite tiring with lots of walking.',
    helpful_count: 5,
    unhelpful_count: 3
  },
  {
    tour_id: '6',
    user_id: '1',
    rating: 4,
    comment: 'Mekong Delta tour was unique and cultural. Great way to experience local life.',
    helpful_count: 12,
    unhelpful_count: 1
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB for reviews seeding');

    const Review = mongoose.model('Review', ReviewSchema);

    // Clear existing data
    await Review.deleteMany({});
    console.log('🗑️ Cleared existing reviews');

    // Insert seed data
    await Review.insertMany(seedData);
    console.log('✅ Reviews seeded successfully!');
    console.log(`📊 Inserted ${seedData.length} reviews`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
