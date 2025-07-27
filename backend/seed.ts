import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserSchema } from './src/modules/users/schemas/user.schema';
import { TourSchema } from './src/modules/tours/schemas/tour.schema';
import { BookingSchema } from './src/modules/booking/schemas/booking.schema';
import { ReviewSchema } from './src/modules/reviews/schemas/review.schema';
import { BlogPostSchema } from './src/modules/blog-post/schemas/blog-post.schema';
import { BlogCommentSchema } from './src/modules/blog-comment/schemas/blog-comment.schema';

async function seed() {
  await mongoose.connect(
    process.env.DB_HOST || 'mongodb://localhost:27017/travelweb'
  );

  const User = mongoose.model('User', UserSchema);
  const Tour = mongoose.model('Tour', TourSchema);
  const Booking = mongoose.model('Booking', BookingSchema);
  const Review = mongoose.model('Review', ReviewSchema);
  const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
  const BlogComment = mongoose.model('BlogComment', BlogCommentSchema);

  // clear old data
  await User.deleteMany({});
  await Tour.deleteMany({});
  await Booking.deleteMany({});
  await Review.deleteMany({});
  await BlogPost.deleteMany({});
  await BlogComment.deleteMany({});

  // hash password function
  const hashPassword = async (plain) => await bcrypt.hash(plain, 10);

  // users (HASH PASSWORD TRƯỚC KHI TẠO)
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
    password: await hashPassword('12345'), // hash password
    role: 'user',
  });

  // tours
  const tour1 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Ha Long Bay',
    description: 'Ha Long Bay is a UNESCO World Heritage site',
    location: 'Ha Long Bay, Vietnam',
    price: 350,
    start_date: new Date('2025-09-01'),
    end_date: new Date('2025-09-05'),
    capacity: 25,
    image: 'https://songhongtourist.vn/upload/2022-12-05/z3934569882341_2da32452683b00f72cdd01e67ff588e4-5.jpg',
  });
  
  const tour2 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Phu Quoc',
    description: 'A beautiful island in Vietnam.',
    location: 'Phu Quoc, Vietnam',
    price: 400,
    start_date: new Date('2025-10-01'),
    end_date: new Date('2025-10-05'),
    capacity: 30,
    image: 'https://vietnam.travel/sites/default/files/2022-10/shutterstock_1660147075.jpg',
  });
  
  const tour3 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Hue',
    description: 'Explore the ancient city of Hue.',
    location: 'Hue, Vietnam',
    price: 250,
    start_date: new Date('2025-11-01'),
    end_date: new Date('2025-11-05'),
    capacity: 18,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg/500px-Th%C3%A0nh_ph%E1%BB%91_Hu%E1%BA%BF_nh%C3%ACn_t%E1%BB%AB_tr%C3%AAn_cao_%282%29.jpg',
  });

  const tour4 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Nha Trang',
    description: 'Relax on the beautiful beaches of Nha Trang.',
    location: 'Nha Trang, Vietnam',
    price: 350,
    start_date: new Date('2025-12-01'),
    end_date: new Date('2025-12-05'),
    capacity: 30,
    image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/0c/b4/e3/infinity-swimming-pool.jpg?w=1400&h=-1&s=1',
  });

  const tour5 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Ho Chi Minh City',
    description: 'The bustling city of Ho Chi Minh.',
    location: 'Ho Chi Minh City, Vietnam',
    price: 150,
    start_date: new Date('2025-12-10'),
    end_date: new Date('2025-12-12'),
    capacity: 20,
    image: 'https://mettavoyage.com/wp-content/uploads/2023/07/Ho-Chi-Minh-City-3.jpg',
  });

  const tour6 = await Tour.create({
    organizer: admin._id,
    title: 'Tour to Mekong Delta',
    description: 'Explore the peaceful Mekong Delta.',
    location: 'Mekong Delta, Vietnam',
    price: 200,
    start_date: new Date('2025-12-15'),
    end_date: new Date('2025-12-18'),
    capacity: 25,
    image: 'https://tse4.mm.bing.net/th/id/OIP.Dw5-ToTDO-t57D1KIgI7bgHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  });

  // bookings
  const booking1 = await Booking.create({
    user: user1._id,
    tour: tour1._id,
    num_people: 2,
    total_price: 400,
    status: 'confirmed',
  });

  const booking2 = await Booking.create({
    user: user2._id,
    tour: tour2._id,
    num_people: 3,
    total_price: 900,
    status: 'pending',
  });

  // reviews
  await Review.create({
    user: user1._id,
    tour: tour1._id,
    content: 'Very nice experience!',
    rating: 5,
  });

  await Review.create({
    user: user2._id,
    tour: tour2._id,
    content: 'Could be better',
    rating: 3,
  });

  // blog post
  const blogPostsData = [
    {
      "title": "Sunset by the cliffs",
      "content": "There is something magical about standing at the edge of the world, feeling the salty breeze brush your cheeks as the sun slowly dips below the horizon. The cliffs, weathered by centuries of wind and water, glow in rich hues of orange and gold. The sound of the ocean waves crashing far below is at once thunderous and soothing, a reminder of nature’s unstoppable rhythm. As I watch the sky transform—pink, then lavender, then deep indigo—I realize this moment, between daylight and darkness, is truly a gift. The world quiets, and even the seabirds seem to pause in reverence. Couples and solo travelers alike find spots to sit and marvel, cameras clicking but unable to fully capture the feeling. Here, the worries of daily life fade with the sun, replaced by awe and gratitude for the beauty of our planet. If you’ve never witnessed a sunset from atop a cliff, add it to your travel list. It’s a memory that lingers, long after the sun has gone.",
      "image": "https://images.unsplash.com/photo-1587502536263-3bdb61c8c6f4"
    },
    {
      "title": "Mountain waterfall escape",
      "content": "Hidden deep within a lush forest, the sound of rushing water grows louder as you hike toward the heart of the mountains. The air is crisp and alive with the scent of moss and earth, sunlight filtering softly through the canopy above. Rounding a bend, you finally see it—a breathtaking waterfall cascading down ancient rocks, tumbling into a crystal-clear pool below. The roar is deafening and exhilarating. Here, time slows down. You shed your shoes, wade into the icy water, and feel instantly refreshed, as if the waterfall washes away more than just dust and sweat. Picnicking on the mossy rocks, you watch dragonflies dance above the water and birds flit between branches. It’s a place to reconnect with nature, far from city noise, where you can listen to your thoughts and the endless song of falling water. This escape is both a physical adventure and a spiritual reset—one you’ll crave again and again.",
      "image": "https://images.unsplash.com/photo-1503264116251-35a269479413"
    },
    {
      "title": "Desert lake reflections",
      "content": "Imagine standing on the edge of a vast, silent lake, surrounded by the endless stretch of desert. The sky overhead is a brilliant canvas of blue, mirrored perfectly in the still surface of the water. There are no sounds but the soft sigh of wind and the occasional call of a distant bird. Here, in this surreal landscape, the boundaries between earth and sky blur, and you feel as though you are walking in a dream. The desert heat is gentle in the morning, but the sun soon climbs high, casting sharp shadows and making the sand shimmer. The lake becomes a sanctuary, a place to reflect—both literally and figuratively. Sitting quietly, you watch clouds drift by, their shapes doubling in the water below. It’s a humbling, peaceful experience, reminding you that beauty exists in the most unexpected places. The desert lake’s serenity is a gentle reminder to slow down, breathe, and appreciate silence.",
      "image": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7"
    },
    {
      "title": "Tropical palm paradise",
      "content": "When you arrive at a true tropical paradise, the first thing you notice is the gentle sway of palm trees against a crystal blue sky. The air smells of salt, coconut, and endless summer. With each step, the sand is warm beneath your feet, leading you to water so clear you can count every grain of sand below. Local children laugh and play, diving in and out of the gentle surf, while travelers stretch out with books and cold drinks under the shade of palms. Every meal feels like a celebration—fresh seafood, sweet fruit, and the kind of conversations that can only happen when time stands still. At sunset, the sky erupts in a symphony of colors, reflected on calm waves. It’s a place where every sense comes alive, where relaxation is not just an activity but a way of life. You don’t just visit a tropical palm paradise—you become a part of it, if only for a little while.",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
    },
    {
      "title": "Zen mountain peaks",
      "content": "Reaching the summit of a tall mountain is never just about the view—it’s about the journey, the effort, and the peace that settles in as you look out across the peaks. The air here is sharp, cold, and clean. With each breath, you feel lighter, more present. Below, clouds drift between the mountains like rivers of mist. The world feels far away, replaced by a silence so profound it rings in your ears. Sitting here, wrapped in a jacket and sipping hot tea, I watch the sun rise over jagged ridges and realize the clarity that altitude brings. Thoughts that felt heavy at sea level seem to vanish. The mountains have a way of making every worry feel smaller. In the stillness, you find yourself. These are moments of pure zen—moments to savor and remember, long after you have descended back to the busy world below.",
      "image": "https://images.unsplash.com/photo-1517054612019-1bf855127c43?ixlib=rb-0.3.5"
    },
    {
      "title": "Foggy forest morning",
      "content": "Walking into a forest shrouded in fog is like stepping into a dream. The trees stand tall and ancient, their trunks disappearing into the white mist. Every sound is muffled; even your footsteps seem softer, as if you are floating. The scent of earth and dew fills your lungs. Sunbeams occasionally pierce the fog, casting magical rays of light across the undergrowth. Birds call to one another, their songs echoing through the mist, and a gentle breeze stirs the leaves. In this world, time feels suspended. You feel a sense of peace, wonder, and connection to something greater than yourself. The fog lifts slowly, revealing details—a spider web strung with dew, a squirrel darting up a trunk. A morning spent in a foggy forest is more than a walk; it’s an invitation to slow down and be present, surrounded by quiet beauty.",
      "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
    },
    {
      "title": "Coastal cliff drama",
      "content": "Standing atop the dramatic cliffs that rise above the ocean, you are treated to one of nature’s great performances. The wind howls, waves smash against stone far below, and the sky is alive with shifting clouds and sunlight. Gulls wheel overhead, their cries lost in the wind. The cliffs themselves are an artwork of color and texture, worn smooth in some places and jagged in others. Adventurous travelers walk along narrow paths, pausing to take in the breathtaking views or snap photos that will never do justice to the real thing. It’s a place for exhilaration and reflection—a reminder that the planet is wild, beautiful, and much older than any of us. As you lean into the wind, you can’t help but feel a deep connection to the power and drama of the natural world, and a sense of gratitude for being a witness to it all.",
      "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
    },
    {
      "title": "Island sunrise vibes",
      "content": "There’s nothing quite like waking up on an island and stepping outside to find the world awash in pastel pinks and oranges. The waves murmur on the sand, and the palms sway in the gentle dawn breeze. Early risers gather on the beach, sharing the quiet magic of the sunrise with a sense of community that comes only from shared awe. Fishermen prepare their boats, birds start their morning calls, and the scent of salt hangs in the air. I sip coffee and watch the colors shift, grateful for the peaceful start. The island comes alive slowly—markets open, laughter echoes, and the promise of new adventure floats on the wind. The calm of sunrise lingers long after, infusing the whole day with a sense of possibility. Island sunrises teach us that every day is a fresh beginning, and every moment can be filled with beauty.",
      "image": "https://images.unsplash.com/photo-1493558103817-58b2924bce98"
    },
    {
      "title": "Snowy mountain serenity",
      "content": "A world covered in snow is a world transformed. The mountains are wrapped in soft white, their peaks sparkling in the crisp winter sun. Each breath feels colder, sharper, but incredibly refreshing. The quiet is almost absolute, broken only by the distant crunch of footsteps or the call of a bird braving the cold. Standing in the stillness, surrounded by snow and sky, you feel both small and infinite. The days are filled with adventure—skiing, snowshoeing, or simply wandering and marveling at the beauty of it all. Evenings are cozy, with fires crackling and warm drinks shared among friends. It’s a place to disconnect from screens and schedules and reconnect with nature and yourself. The serenity of snowy mountains is more than scenery—it’s a feeling of calm, a reminder that there’s beauty and peace to be found, even in the coldest months.",
      "image": "https://tse1.mm.bing.net/th/id/OIP.g0ZenQz4cP6ipzh-frfKeQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
      "title": "Lakeside reflection moments",
      "content": "Sitting by a quiet lake, you are treated to nature’s perfect mirror. The water is so still that every tree, cloud, and mountain is doubled in its surface. Time seems to slow as you listen to the gentle lap of water at the shore and the occasional splash of a fish. Ducks glide silently, leaving ripples that shimmer in the morning sun. This is a place for contemplation—for journaling, sketching, or simply breathing. The peaceful atmosphere encourages deep conversations or comfortable silence, shared with friends or savored alone. As the day unfolds, the light changes, and so does the mood of the lake, shifting from misty blue to dazzling gold. Evenings bring stars reflected on the surface, making you feel as if you’re floating between two skies. Lakeside moments are memories made in stillness, where the world feels just right.",
      "image": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"
    },
  ];
  
  for (const data of blogPostsData) {
    await BlogPost.create({
      author: user1._id,
      title: data.title,
      content: data.content,
      image: data.image,
    });
  }

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

  console.log('✅ Seed done!');
  process.exit();
}

seed();
