import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_blog?authSource=admin';

const BlogPostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author_id: String,
  tags: [String],
  status: String,
  view_count: { type: Number, default: 0 },
  like_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const seedData = [
  {
    title: 'Top 10 Hidden Beaches in Vietnam',
    content: 'Discover the most beautiful and least crowded beaches in Vietnam. From pristine white sand to crystal clear waters, these hidden gems are perfect for a peaceful getaway. Includes recommendations for accommodation, local food, and water activities.',
    author_id: '1',
    tags: ['beaches', 'vietnam', 'travel', 'hidden-gems'],
    status: 'published',
    view_count: 245,
    like_count: 32
  },
  {
    title: 'Cultural Guide to Ha Long Bay',
    content: 'Learn about the rich history and culture of Ha Long Bay. This comprehensive guide covers the formation of the limestone karsts, local legends, and the best times to visit. Includes information about traditional fishing villages and cave explorations.',
    author_id: '2',
    tags: ['ha-long-bay', 'culture', 'geology', 'travel-guide'],
    status: 'published',
    view_count: 189,
    like_count: 28
  },
  {
    title: 'Vietnam Street Food Adventure',
    content: 'A culinary journey through the streets of Vietnam. Discover the most popular street foods, from pho to banh mi, and learn about their history and preparation. Includes tips on where to find the best vendors and how to eat safely from street stalls.',
    author_id: '3',
    tags: ['food', 'vietnam', 'culinary', 'street-food'],
    status: 'published',
    view_count: 312,
    like_count: 45
  },
  {
    title: 'Best Time to Visit Vietnam',
    content: 'Planning a trip to Vietnam? This guide helps you choose the best time based on weather, festivals, and tourism seasons. Includes detailed information about monsoons, typhoons, and regional variations.',
    author_id: '1',
    tags: ['vietnam', 'travel-planning', 'weather', 'seasons'],
    status: 'published',
    view_count: 156,
    like_count: 20
  },
  {
    title: 'Phu Quoc Island: Paradise in Vietnam',
    content: 'Explore Phu Quoc Island, known for its pristine beaches, water sports, and vibrant nightlife. This comprehensive guide covers the top attractions, best restaurants, and accommodation options. Learn about the island\'s history as a pearl farming center.',
    author_id: '2',
    tags: ['phu-quoc', 'island', 'beach', 'travel'],
    status: 'published',
    view_count: 234,
    like_count: 38
  },
  {
    title: 'Sustainable Tourism in Vietnam',
    content: 'How to travel responsibly in Vietnam while supporting local communities. This guide covers eco-friendly accommodations, sustainable tour operators, and ethical wildlife interactions. Learn how to minimize your environmental impact.',
    author_id: '3',
    tags: ['sustainability', 'eco-tourism', 'vietnam', 'responsible-travel'],
    status: 'published',
    view_count: 127,
    like_count: 24
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB for blog seeding');

    const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

    // Clear existing data
    await BlogPost.deleteMany({});
    console.log('🗑️ Cleared existing blog posts');

    // Insert seed data
    await BlogPost.insertMany(seedData);
    console.log('✅ Blog posts seeded successfully!');
    console.log(`📊 Inserted ${seedData.length} blog posts`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
