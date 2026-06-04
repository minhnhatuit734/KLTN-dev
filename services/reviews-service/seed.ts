require('dotenv').config({ path: '../../.env' });
import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_ATLAS_URI ? `${process.env.MONGO_ATLAS_URI}/tour_reviews` : 'mongodb://admin:password@mongodb:27017/tour_reviews?authSource=admin';

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
    comment: 'Amazing experience! Ha Long Bay luxury cruise was absolutely breathtaking. Great guides and excellent 5-star service.',
    helpful_count: 45,
    unhelpful_count: 1
  },
  {
    tour_id: '1',
    user_id: '2',
    rating: 4,
    comment: 'Beautiful scenery, friendly crew. Cable car experience was unforgettable.',
    helpful_count: 22,
    unhelpful_count: 2
  },
  {
    tour_id: '2',
    user_id: '3',
    rating: 5,
    comment: 'Best budget tour ever! Ha Long experience without breaking the bank. Highly recommended!',
    helpful_count: 38,
    unhelpful_count: 0
  },
  {
    tour_id: '3',
    user_id: '4',
    rating: 5,
    comment: 'Phu Quoc paradise! Crystal clear waters, pristine beaches, snorkeling was incredible.',
    helpful_count: 51,
    unhelpful_count: 1
  },
  {
    tour_id: '3',
    user_id: '5',
    rating: 5,
    comment: 'Pearl farming tour was fascinating. Food amazing, hotel excellent, memories forever!',
    helpful_count: 33,
    unhelpful_count: 0
  },
  {
    tour_id: '4',
    user_id: '1',
    rating: 4,
    comment: 'Great Sao Beach experience. Water so clear and warm. Would come again.',
    helpful_count: 19,
    unhelpful_count: 1
  },
  {
    tour_id: '5',
    user_id: '6',
    rating: 5,
    comment: 'Da Nang-Hoi An combo perfect! Ancient town magical, Marble Mountains stunning.',
    helpful_count: 42,
    unhelpful_count: 0
  },
  {
    tour_id: '5',
    user_id: '3',
    rating: 4,
    comment: 'Cooking class was fun and educational. Hoi An streets beautiful at night.',
    helpful_count: 25,
    unhelpful_count: 2
  },
  {
    tour_id: '6',
    user_id: '7',
    rating: 5,
    comment: 'Da Nang beaches gorgeous! Dragon Bridge worth the visit. Great nightlife recommendations.',
    helpful_count: 35,
    unhelpful_count: 1
  },
  {
    tour_id: '7',
    user_id: '2',
    rating: 5,
    comment: 'Hue historical tour incredible! Guides very knowledgeable about Nguyen Dynasty.',
    helpful_count: 40,
    unhelpful_count: 0
  },
  {
    tour_id: '7',
    user_id: '4',
    rating: 4,
    comment: 'Royal cuisine tasting unique. Citadel impressive. Huong River cruise beautiful.',
    helpful_count: 28,
    unhelpful_count: 1
  },
  {
    tour_id: '8',
    user_id: '5',
    rating: 5,
    comment: 'Hue-Hoi An 4 days perfect journey! Experienced best of central Vietnam.',
    helpful_count: 44,
    unhelpful_count: 0
  },
  {
    tour_id: '9',
    user_id: '6',
    rating: 5,
    comment: 'Nha Trang snorkeling paradise! Coral reefs vibrant, underwater museum fascinating.',
    helpful_count: 49,
    unhelpful_count: 0
  },
  {
    tour_id: '9',
    user_id: '1',
    rating: 4,
    comment: 'Island hopping fun, seafood fresh. Weather perfect for beach activities.',
    helpful_count: 26,
    unhelpful_count: 2
  },
  {
    tour_id: '10',
    user_id: '7',
    rating: 5,
    comment: 'Nha Trang city tour well organized. Night market lively, temples beautiful.',
    helpful_count: 31,
    unhelpful_count: 1
  },
  {
    tour_id: '11',
    user_id: '3',
    rating: 5,
    comment: 'Mekong Delta authentic! Floating markets amazing, homestay experience touching.',
    helpful_count: 47,
    unhelpful_count: 0
  },
  {
    tour_id: '11',
    user_id: '2',
    rating: 4,
    comment: 'Cultural immersion wonderful. Coconut candy production interesting, food delicious.',
    helpful_count: 29,
    unhelpful_count: 2
  },
  {
    tour_id: '12',
    user_id: '4',
    rating: 5,
    comment: 'Sapa trekking life-changing! Rice terraces breathtaking, ethnic villages welcoming.',
    helpful_count: 55,
    unhelpful_count: 0
  },
  {
    tour_id: '12',
    user_id: '5',
    rating: 5,
    comment: 'Mountain trek challenging but rewarding. Homestay with local Hmong family amazing.',
    helpful_count: 38,
    unhelpful_count: 0
  },
  {
    tour_id: '13',
    user_id: '6',
    rating: 5,
    comment: 'Fansipan cable car experience thrilling! Heaven Gate photo spot incredible.',
    helpful_count: 52,
    unhelpful_count: 1
  },
  {
    tour_id: '13',
    user_id: '1',
    rating: 4,
    comment: 'Cloud forest trekking mysterious and beautiful. Market visit cultural insight.',
    helpful_count: 24,
    unhelpful_count: 1
  },
  {
    tour_id: '14',
    user_id: '7',
    rating: 5,
    comment: 'Da Lat perfect romantic getaway! Coffee plantations peaceful, Love Valley charming.',
    helpful_count: 43,
    unhelpful_count: 0
  },
  {
    tour_id: '14',
    user_id: '3',
    rating: 4,
    comment: 'Flower market colorful, Dalat Palace elegant. Weather cool and comfortable.',
    helpful_count: 27,
    unhelpful_count: 1
  },
  {
    tour_id: '15',
    user_id: '2',
    rating: 5,
    comment: 'Ninh Binh Tam Coc stunning! Karst landscape photographer\'s dream. Hang Mua view worth the climb!',
    helpful_count: 48,
    unhelpful_count: 0
  },
  {
    tour_id: '15',
    user_id: '4',
    rating: 5,
    comment: 'Cycling through rice fields peaceful. Boat tour through caves magical. Fewer tourists than Ha Long!',
    helpful_count: 41,
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
