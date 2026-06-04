require('dotenv').config({ path: '../../.env' });
import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_ATLAS_URI ? `${process.env.MONGO_ATLAS_URI}/tour_blog` : 'mongodb://admin:password@mongodb:27017/tour_blog?authSource=admin';

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
    title: 'Top 10 Hidden Beaches in Vietnam - Complete Guide',
    content: 'Discover the most beautiful and least crowded beaches in Vietnam. From pristine white sand to crystal clear waters, these hidden gems are perfect for a peaceful getaway. Includes recommendations for accommodation, local food, and water activities at each beach.',
    author_id: '1',
    tags: ['beaches', 'vietnam', 'travel', 'hidden-gems'],
    status: 'published',
    view_count: 245,
    like_count: 32
  },
  {
    title: '3-Day Ha Long Bay Itinerary for First Timers',
    content: 'Planning your first Ha Long Bay trip? This detailed itinerary covers the best cruise options, must-see caves and islands, local cuisine you cannot miss, and insider tips on avoiding crowds. Learn about the geology of limestone karsts and local legends.',
    author_id: '2',
    tags: ['ha-long-bay', 'itinerary', 'travel-guide', 'must-visit'],
    status: 'published',
    view_count: 189,
    like_count: 28
  },
  {
    title: 'Vietnam Street Food Adventure: A Culinary Journey',
    content: 'A comprehensive guide to Vietnamese street food culture. From pho and banh mi to bánh xèo and spring rolls, discover the history and preparation of iconic Vietnamese dishes. Learn where to find the best vendors and how to eat safely from street stalls.',
    author_id: '3',
    tags: ['food', 'vietnam', 'culinary', 'street-food'],
    status: 'published',
    view_count: 312,
    like_count: 45
  },
  {
    title: 'When to Visit Vietnam: Seasonal Travel Guide 2025',
    content: 'Planning a trip to Vietnam? This comprehensive guide helps you choose the best time based on weather patterns, festivals, and tourism seasons by region. Includes detailed information about monsoons, typhoons, and regional variations affecting your travels.',
    author_id: '1',
    tags: ['vietnam', 'travel-planning', 'weather', 'seasons'],
    status: 'published',
    view_count: 156,
    like_count: 20
  },
  {
    title: 'Phu Quoc Island: The Pearl of Vietnam Complete Guide',
    content: 'Explore Phu Quoc Island, known for its pristine beaches, water sports, and vibrant nightlife. This comprehensive guide covers top attractions including Sao Beach, night market, pearl farms, best restaurants, and accommodation options for all budgets.',
    author_id: '2',
    tags: ['phu-quoc', 'island', 'beach', 'travel'],
    status: 'published',
    view_count: 234,
    like_count: 38
  },
  {
    title: 'Sustainable Tourism in Vietnam: Travel Responsibly',
    content: 'How to travel responsibly in Vietnam while supporting local communities. Discover eco-friendly accommodations, sustainable tour operators, ethical wildlife interactions, and ways to minimize your environmental impact. Support local artisans and farmers.',
    author_id: '3',
    tags: ['sustainability', 'eco-tourism', 'vietnam', 'responsible-travel'],
    status: 'published',
    view_count: 127,
    like_count: 24
  },
  {
    title: 'Sapa Mountain Trek: Trekking Through Vietnam\'s Highlands',
    content: 'Complete guide to trekking in Sapa with detailed trail descriptions, difficulty levels, best seasons, and what to pack. Explore ethnic minority villages, learn about H\'Mong and Dzao cultures, stay in homestays, and experience breathtaking rice terraces.',
    author_id: '1',
    tags: ['trekking', 'mountains', 'adventure', 'sapa'],
    status: 'published',
    view_count: 198,
    like_count: 35
  },
  {
    title: 'Da Lat: Vietnam\'s City of Eternal Spring',
    content: 'Discover the romantic city of Da Lat with its French colonial architecture, temperate climate, and coffee plantations. Explore Dalat Palace, Love Valley, Xuan Huong Lake, and visit flower markets. Perfect for couples and nature lovers seeking a peaceful escape.',
    author_id: '2',
    tags: ['dalat', 'romantic', 'nature', 'travel'],
    status: 'published',
    view_count: 176,
    like_count: 41
  },
  {
    title: 'Mekong Delta Floating Markets: Experience Authentic Vietnam',
    content: 'Explore the vibrant floating markets of the Mekong Delta. Experience sunrise boat tours, visit coconut candy factories, learn rice noodle production, stay with local families, and enjoy regional cuisine. Includes tips for the best photography spots and market timings.',
    author_id: '3',
    tags: ['mekong', 'markets', 'culture', 'experience'],
    status: 'published',
    view_count: 214,
    like_count: 33
  },
  {
    title: 'Hue: Vietnam\'s Ancient Imperial Capital',
    content: 'Explore UNESCO World Heritage Hue. Visit the Citadel and imperial palaces, explore royal tombs, take Huong River boat tours, experience traditional royal cuisine, and learn about Vietnamese history and culture from the Nguyen Dynasty.',
    author_id: '1',
    tags: ['hue', 'history', 'culture', 'heritage'],
    status: 'published',
    view_count: 167,
    like_count: 26
  },
  {
    title: 'Hoi An Ancient Town: Walking Through History',
    content: 'Step back in time in Hoi An\'s lantern-lit streets. Explore the old town architecture, visit assembly halls and pagodas, try traditional tailoring, take cooking classes, and enjoy riverside dining. Includes practical tips for photography and avoiding crowds.',
    author_id: '2',
    tags: ['hoian', 'ancient-town', 'photography', 'culture'],
    status: 'published',
    view_count: 203,
    like_count: 39
  },
  {
    title: 'Da Nang: Modern City Meets Beaches',
    content: 'Discover Da Nang, Vietnam\'s fastest growing city. Explore My Khe Beach, climb Dragon Bridge, visit Marble Mountains, enjoy water sports, and experience the vibrant nightlife at Han Market and local restaurants. Perfect for beach lovers and adventure seekers.',
    author_id: '3',
    tags: ['danang', 'beaches', 'city', 'modern'],
    status: 'published',
    view_count: 191,
    like_count: 30
  },
  {
    title: 'Nha Trang: Vietnam\'s Premier Beach Destination',
    content: 'Comprehensive guide to Nha Trang featuring island hopping at Mun and Mot islands, snorkeling at coral reefs, visiting the underwater museum, enjoying fresh seafood, and experiencing nightlife at the beach town. Plus insider tips for the best accommodations and restaurants.',
    author_id: '1',
    tags: ['nhatrang', 'snorkeling', 'beaches', 'island'],
    status: 'published',
    view_count: 228,
    like_count: 42
  },
  {
    title: 'Ninh Binh: Vietnam\'s Underrated Wonder - Karst Landscape Tour',
    content: 'Explore Ninh Binh\'s stunning karst landscapes through Tam Coc valleys via boat and cycling. Climb Hang Mua for panoramic views, visit cave systems, cycle through rice fields, and stay at local homestays. A photographer\'s paradise with fewer tourists than Ha Long.',
    author_id: '2',
    tags: ['ninhbinh', 'nature', 'photography', 'karst'],
    status: 'published',
    view_count: 206,
    like_count: 37
  },
  {
    title: 'Vietnam Cooking Classes: Learn to Cook Like a Local',
    content: 'Discover the best cooking classes across Vietnam from Hanoi to Ho Chi Minh City. Learn authentic recipes, shop at local markets, cook with fresh ingredients, and enjoy meals you prepared. Includes recommendations for family-friendly classes and culinary tours.',
    author_id: '3',
    tags: ['cooking', 'culture', 'experience', 'food'],
    status: 'published',
    view_count: 182,
    like_count: 29
  },
  {
    title: 'Budget Travel in Vietnam: Complete Money-Saving Guide',
    content: 'Travel Vietnam on a budget with this comprehensive guide. Learn about transportation options, budget accommodations, street food dining, free attractions, and how to avoid tourist traps. Includes estimated daily budgets for backpackers and practical money-saving tips.',
    author_id: '1',
    tags: ['budget', 'travel-tips', 'money', 'backpacking'],
    status: 'published',
    view_count: 245,
    like_count: 44
  },
  {
    title: 'Vietnam Photography Guide: Capture Perfect Travel Moments',
    content: 'Essential photography guide for Vietnam travelers. Discover the best locations for photography at sunrise and sunset, learn composition tips, understand lighting in tropical climate, and get technical recommendations for different camera types. Includes location coordinates.',
    author_id: '2',
    tags: ['photography', 'tips', 'guide', 'travel'],
    status: 'published',
    view_count: 218,
    like_count: 36
  },
  {
    title: 'Vietnam Visa: Everything You Need to Know',
    content: 'Complete visa guide for traveling to Vietnam. Understand visa types (tourist, business, e-visa), application procedures, required documents, processing times, costs, and common questions answered. Updated information for 2025 visa requirements and regulations.',
    author_id: '3',
    tags: ['visa', 'documentation', 'travel-tips', 'practical'],
    status: 'published',
    view_count: 172,
    like_count: 22
  },
  {
    title: 'Best Time to Trek Sapa: Seasonal Guide and Weather',
    content: 'Plan your Sapa trekking adventure with this seasonal guide. Learn about weather patterns by month, crowd levels, best visibility for mountain views, and what to pack for each season. Includes recommendations for optimal trekking times and trail conditions.',
    author_id: '1',
    tags: ['sapa', 'trekking', 'seasonal', 'guide'],
    status: 'published',
    view_count: 189,
    like_count: 31
  },
  {
    title: 'Vietnam Cultural Etiquette: Travel Tips & Local Customs',
    content: 'Learn Vietnamese cultural norms and etiquette to show respect during your travels. Understanding customs around temples, greetings, dining, photography, and behavior. Practical tips for respectful interactions with locals and avoiding cultural misunderstandings.',
    author_id: '2',
    tags: ['culture', 'etiquette', 'customs', 'travel-tips'],
    status: 'published',
    view_count: 156,
    like_count: 25
  },
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
