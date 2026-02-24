import * as mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://admin:password@mongodb:27017/tour_chat?authSource=admin';

const ChatSchema = new mongoose.Schema({
  conversation_id: String,
  user_id: String,
  agent_id: String,
  message: String,
  message_type: String,
  is_user_message: Boolean,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const ConversationSchema = new mongoose.Schema({
  user_id: String,
  agent_id: String,
  subject: String,
  status: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_message: String
});

const seedData = [
  {
    conversation_id: 'conv_1',
    user_id: '1',
    agent_id: '1',
    message: 'Hi, I have a question about the Ha Long Bay tour',
    message_type: 'text',
    is_user_message: true,
    timestamp: new Date('2024-01-20T10:00:00'),
    read: true
  },
  {
    conversation_id: 'conv_1',
    user_id: '1',
    agent_id: '1',
    message: 'Welcome! I\'d be happy to help you with the Ha Long Bay tour. What would you like to know?',
    message_type: 'text',
    is_user_message: false,
    timestamp: new Date('2024-01-20T10:05:00'),
    read: true
  },
  {
    conversation_id: 'conv_1',
    user_id: '1',
    agent_id: '1',
    message: 'What is included in the tour package?',
    message_type: 'text',
    is_user_message: true,
    timestamp: new Date('2024-01-20T10:10:00'),
    read: true
  },
  {
    conversation_id: 'conv_1',
    user_id: '1',
    agent_id: '1',
    message: 'The Ha Long Bay tour includes: cruise with meals, visit to Sung Sot cave, kayaking activities, and accommodation on a luxury cruise ship.',
    message_type: 'text',
    is_user_message: false,
    timestamp: new Date('2024-01-20T10:15:00'),
    read: true
  },
  {
    conversation_id: 'conv_2',
    user_id: '2',
    agent_id: '1',
    message: 'I need help booking the Phu Quoc tour',
    message_type: 'text',
    is_user_message: true,
    timestamp: new Date('2024-01-21T09:30:00'),
    read: true
  },
  {
    conversation_id: 'conv_2',
    user_id: '2',
    agent_id: '1',
    message: 'Sure! I can help you book the Phu Quoc tour. When would you like to travel?',
    message_type: 'text',
    is_user_message: false,
    timestamp: new Date('2024-01-21T09:35:00'),
    read: true
  },
  {
    conversation_id: 'conv_3',
    user_id: '3',
    agent_id: '1',
    message: 'What are the payment options?',
    message_type: 'text',
    is_user_message: true,
    timestamp: new Date('2024-01-22T14:20:00'),
    read: false
  },
  {
    conversation_id: 'conv_3',
    user_id: '3',
    agent_id: '1',
    message: 'We accept credit cards, bank transfers, and online payment platforms like PayPal and Stripe.',
    message_type: 'text',
    is_user_message: false,
    timestamp: new Date('2024-01-22T14:25:00'),
    read: false
  }
];

const conversationData = [
  {
    user_id: '1',
    agent_id: '1',
    subject: 'Ha Long Bay Tour Question',
    status: 'closed',
    created_at: new Date('2024-01-20T10:00:00'),
    updated_at: new Date('2024-01-20T10:15:00'),
    last_message: 'The Ha Long Bay tour includes: cruise with meals, visit to Sung Sot cave, kayaking activities, and accommodation on a luxury cruise ship.'
  },
  {
    user_id: '2',
    agent_id: '1',
    subject: 'Phu Quoc Tour Booking',
    status: 'active',
    created_at: new Date('2024-01-21T09:30:00'),
    updated_at: new Date('2024-01-21T09:35:00'),
    last_message: 'Sure! I can help you book the Phu Quoc tour. When would you like to travel?'
  },
  {
    user_id: '3',
    agent_id: '1',
    subject: 'Payment Options',
    status: 'active',
    created_at: new Date('2024-01-22T14:20:00'),
    updated_at: new Date('2024-01-22T14:25:00'),
    last_message: 'We accept credit cards, bank transfers, and online payment platforms like PayPal and Stripe.'
  }
];

async function seed() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB for chat seeding');

    const Chat = mongoose.model('Chat', ChatSchema);
    const Conversation = mongoose.model('Conversation', ConversationSchema);

    // Clear existing data
    await Chat.deleteMany({});
    await Conversation.deleteMany({});
    console.log('🗑️ Cleared existing chat messages and conversations');

    // Insert seed data
    await Chat.insertMany(seedData);
    await Conversation.insertMany(conversationData);
    console.log('✅ Chat data seeded successfully!');
    console.log(`📊 Inserted ${seedData.length} messages and ${conversationData.length} conversations`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
