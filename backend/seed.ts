import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from './src/modules/users/schemas/user.schema';
import { TourSchema } from './src/modules/tours/schemas/tour.schema';
import { BookingSchema } from './src/modules/booking/schemas/booking.schema';
import { ReviewSchema } from './src/modules/reviews/schemas/review.schema';
import { BlogPostSchema } from './src/modules/blog-post/schemas/blog-post.schema';
import { BlogCommentSchema } from './src/modules/blog-comment/schemas/blog-comment.schema';

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGO_URL || 'mongodb://localhost:27017/travelweb',
      {
        retryWrites: true,
        w: 'majority',
      } as any
    );
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  const User = mongoose.model('User', UserSchema);
  const Tour = mongoose.model('Tour', TourSchema);
  const Booking = mongoose.model('Booking', BookingSchema);
  const Review = mongoose.model('Review', ReviewSchema);
  const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
  const BlogComment = mongoose.model('BlogComment', BlogCommentSchema);

  // clear old data (with error handling for auth issues)
  try {
    await User.deleteMany({});
    await Tour.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await BlogPost.deleteMany({});
    await BlogComment.deleteMany({});
    console.log('Old data cleared');
  } catch (error) {
    console.log('Could not clear old data (auth issue), proceeding with insert...');
  }

  // hash password function
  const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

  try {
    // users (HASH PASSWORD TRÆ¯á»šC KHI Táº O)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hashPassword('123'), // hash password
      role: 'admin',
      phone: '123456789',
    });

    const user1 = await User.create({
      name: 'user1',
      email: 'user1@example.com',
      password: await hashPassword('1234'), // hash password
      role: 'user',
    });

    const user2 = await User.create({
      name: 'user2',
      email: 'user2@example.com',
      password: await hashPassword('1234'), // hash password
      role: 'user',
    });

    // tours
    const tour1 = await Tour.create({
      name: 'Sapa tour',
      slug: 'sapa-tour',
      description: 'Sapa is a beautiful destination',
      duration: 3,
      price: 2000000,
      rating: 4.5,
      views: 100,
      image: 'https://th.bing.com/th/id/OIP.SFd8uKmKQwXYzvf4S3cZwAHaE7?w=720&h=540&rs=1&pid=ImgDetMain',
      location: 'Sapa, Lao Cai',
      highlights: ['Hiking', 'Local culture', 'Fresh air'],
      itinerary: ['Day 1: Arrival', 'Day 2: Hiking', 'Day 3: Departure'],
    });

    const tour2 = await Tour.create({
      name: 'Ha Long Bay',
      slug: 'ha-long-bay',
      description: 'Ha Long Bay - UNESCO World Heritage Site',
      duration: 2,
      price: 3000000,
      rating: 4.8,
      views: 200,
      image: 'https://th.bing.com/th/id/OIP.2fZFRLZcNZSE8sJl_hf4LwHaE7?w=720&h=540&rs=1&pid=ImgDetMain',
      location: 'Ha Long Bay, Quang Ninh',
      highlights: ['Cruise', 'Limestone islands', 'Sunset'],
      itinerary: ['Day 1: Cruise', 'Day 2: Exploration'],
    });

    // booking
    await Booking.create({
      user: user1._id,
      tour: tour1._id,
      bookingDate: new Date(),
      numberOfPeople: 2,
      totalPrice: 4000000,
    });

    // review
    await Review.create({
      user: user2._id,
      tour: tour1._id,
      rating: 5,
      comment: 'Amazing tour experience!',
    });

    // blog post
    const blog = await BlogPost.create({
      author: user1._id,
      title: 'My travel tips',
      content: 'Here are some tips when going to Sapa...',
      image: 'https://th.bing.com/th/id/R.0a0e45bcb17049bb8621177b2739607a?rik=0TJtSY4FvKBh7Q&pid=ImgRaw&r=0',
    });

    // blog comment
    await BlogComment.create({
      user: user2._id,
      post: blog._id,
      comment: 'Great tips, thank you!',
    });

    console.log('âœ… Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
