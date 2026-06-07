/* eslint-disable no-console */
const API_BASE = process.env.API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // keep raw text
  }

  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function clearByList(listPath, idKey = '_id') {
  let rows;
  try {
    rows = await request(listPath);
  } catch {
    console.log(`  Skipping clear ${listPath} (not reachable)`);
    return 0;
  }
  if (!Array.isArray(rows)) return 0;
  let count = 0;
  for (const row of rows) {
    if (!row?.[idKey]) continue;
    try {
      await request(`${listPath}/${row[idKey]}`, { method: 'DELETE' });
      count += 1;
    } catch {
      // continue
    }
  }
  return count;
}

async function seed() {
  console.log(`\n🌱 Seeding via ${API_BASE}\n`);

  // ── Clear existing data ──────────────────────────────────────────
  console.log('🗑️  Clearing existing data...');
  const deletedUsers    = await clearByList('/users');
  const deletedTours    = await clearByList('/tours');
  const deletedBookings = await clearByList('/bookings');   // use /bookings (direct service path)
  const deletedReviews  = await clearByList('/reviews');
  const deletedPosts    = await clearByList('/blog-post');
  console.log(`   Deleted: ${deletedUsers} users, ${deletedTours} tours, ${deletedBookings} bookings, ${deletedReviews} reviews, ${deletedPosts} posts`);

  // ── Users ────────────────────────────────────────────────────────
  console.log('\n👤 Creating users...');
  const usersPayload = [
    { name: 'Admin User',   email: 'admin@example.com',  password: '123456', role: 'admin', phone: '0900000001' },
    { name: 'Nguyen Van A', email: 'user1@example.com',  password: '123456', role: 'user',  phone: '0900000002' },
    { name: 'Tran Thi B',   email: 'user2@example.com',  password: '123456', role: 'user',  phone: '0900000003' },
    { name: 'Le Van C',     email: 'user3@example.com',  password: '123456', role: 'user',  phone: '0900000004' },
    { name: 'Pham Thi D',   email: 'user4@example.com',  password: '123456', role: 'user',  phone: '0900000005' },
    { name: 'Hoang Van E',  email: 'user5@example.com',  password: '123456', role: 'user',  phone: '0900000006' },
    { name: 'Vu Thi F',     email: 'user6@example.com',  password: '123456', role: 'user',  phone: '0900000007' },
    { name: 'Do Van G',     email: 'user7@example.com',  password: '123456', role: 'user',  phone: '0900000008' },
  ];
  const users = [];
  for (const u of usersPayload) {
    const created = await request('/users', { method: 'POST', body: JSON.stringify(u) });
    users.push(created);
  }
  console.log(`   ✅ Created ${users.length} users`);

  // ── Tours ────────────────────────────────────────────────────────
  console.log('\n🗺️  Creating tours...');

  // High-quality, reliable Unsplash photos for Vietnam travel
  // High-quality, reliable Unsplash photos for Vietnam travel
  const IMG = {
    halong:   'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&auto=format&fit=crop',
    phuquoc:  'https://images.unsplash.com/photo-1568819317551-31051b37f69f?w=900&auto=format&fit=crop',
    danang:   'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&auto=format&fit=crop',
    hue:      'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=900&auto=format&fit=crop',
    nhatrang: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop',
    cantho:   'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&auto=format&fit=crop',
    sapa:     'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=900&auto=format&fit=crop',
    dalat:    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop',
    ninhbinh: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&auto=format&fit=crop',
    hoian:    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&auto=format&fit=crop',
  };

  const toursPayload = [
    {
      title: 'Hạ Long Bay Luxury Cruise 3N2D',
      description: 'Khám phá Di sản Thế giới UNESCO với du thuyền 5 sao, chèo thuyền kayak trên làn nước trong vắt, khám phá hang động cùng hướng dẫn viên địa phương và thưởng thức hải sản tươi sống trên tàu.',
      location: 'Hạ Long',
      price: 5200000,
      capacity: 25,
      image: IMG.halong,
    },
    {
      title: 'Hạ Long Bay Budget Adventure',
      description: 'Trải nghiệm vịnh Hạ Long tiết kiệm, khoang cabin chia sẻ, thăm Hang Thiên Cung và đảo Titov.',
      location: 'Hạ Long',
      price: 2400000,
      capacity: 30,
      image: IMG.halong,
    },
    {
      title: 'Phú Quốc Island Paradise 5D4N',
      description: 'Tour đảo, lặn ngắm san hô, tham quan trang trại ngọc trai, chợ đêm phú quốc, hải sản tươi sống, bãi biển cát trắng.',
      location: 'Phú Quốc',
      price: 6500000,
      capacity: 20,
      image: IMG.phuquoc,
    },
    {
      title: 'Phú Quốc Beach Escape 3D2N',
      description: 'Thư giãn tại bãi Sao, hoạt động thể thao dưới nước, du thuyền ngắm hoàng hôn, tour ẩm thực đảo địa phương.',
      location: 'Phú Quốc',
      price: 4200000,
      capacity: 25,
      image: IMG.phuquoc,
    },
    {
      title: 'Đà Nẵng – Hội An Ancient Town Combo',
      description: 'Tour thành phố Đà Nẵng, Ngũ Hành Sơn, Bãi Mỹ Khê, dạo phố cổ Hội An lung linh đèn lồng, lớp học nấu ăn truyền thống.',
      location: 'Đà Nẵng',
      price: 3800000,
      capacity: 22,
      image: IMG.danang,
    },
    {
      title: 'Đà Nẵng Beach & Adventure',
      description: 'Khám phá các bãi biển Đà Nẵng, thể thao nước tại Mỹ Khê, ngắm Cầu Rồng về đêm, trải nghiệm ẩm thực chợ Hàn.',
      location: 'Đà Nẵng',
      price: 2800000,
      capacity: 28,
      image: IMG.danang,
    },
    {
      title: 'Huế Imperial City Heritage Tour',
      description: 'Khám phá Di sản UNESCO, Hoàng thành và lăng tẩm, tour thuyền sông Hương, trải nghiệm ẩm thực cung đình.',
      location: 'Huế',
      price: 3400000,
      capacity: 18,
      image: IMG.hue,
    },
    {
      title: 'Huế – Hội An Connection 4D3N',
      description: 'Các di tích hoàng gia Huế, di chuyển về Hội An, khám phá phố cổ, lớp học nấu ăn, thư giãn biển.',
      location: 'Huế',
      price: 4800000,
      capacity: 20,
      image: IMG.hue,
    },
    {
      title: 'Nha Trang Beach Paradise 4D3N',
      description: 'Bãi biển Nha Trang, tour đảo (Mun, Mốt, Ba đảo), lặn ngắm san hô, tham quan bảo tàng dưới nước.',
      location: 'Nha Trang',
      price: 4500000,
      capacity: 24,
      image: IMG.nhatrang,
    },
    {
      title: 'Nha Trang City & Sea Adventure',
      description: 'Tour thành phố Nha Trang, tháp Po Nagar, chùa Long Sơn, ẩm thực ven biển, tắm biển ban đêm.',
      location: 'Nha Trang',
      price: 3200000,
      capacity: 28,
      image: IMG.nhatrang,
    },
    {
      title: 'Mekong Delta Floating Markets 3D2N',
      description: 'Tour chợ nổi, sản xuất kẹo dừa, làm bún gạo, trải nghiệm homestay, du thuyền ngắm hoàng hôn trên sông.',
      location: 'Cần Thơ',
      price: 3100000,
      capacity: 16,
      image: IMG.cantho,
    },
    {
      title: 'Sapa Mountain Trek & Villages 4D3N',
      description: 'Trekking qua ruộng bậc thang, thăm bản làng dân tộc thiểu số (H\'Mông, Dao), cắm trại, thưởng thức ẩm thực địa phương, leo núi ngắm bình minh.',
      location: 'Sapa',
      price: 5200000,
      capacity: 15,
      image: IMG.sapa,
    },
    {
      title: 'Sapa Heaven Gate & Fansipan Summit',
      description: 'Cáp treo Fansipan, Cổng Trời chụp ảnh đẹp, trekking qua rừng mây, tham quan chợ phiên dân tộc.',
      location: 'Sapa',
      price: 4800000,
      capacity: 20,
      image: IMG.sapa,
    },
    {
      title: 'Đà Lạt Romantic Getaway 3D2N',
      description: 'Thăm vườn cà phê, ngắm cảnh Đà Lạt Palace, Thung lũng Tình Yêu, hồ Xuân Hương, chợ hoa địa phương, kiến trúc Pháp cổ.',
      location: 'Đà Lạt',
      price: 3400000,
      capacity: 20,
      image: IMG.dalat,
    },
    {
      title: 'Ninh Bình Karst Landscape 3D2N',
      description: 'Tour thuyền qua thung lũng đá vôi Tam Cốc, khám phá hang động, đạp xe qua cánh đồng lúa, leo Hang Múa ngắm toàn cảnh.',
      location: 'Ninh Bình',
      price: 3800000,
      capacity: 22,
      image: IMG.ninhbinh,
    },
    {
      title: 'Hội An Ancient Town Discovery 2D1N',
      description: 'Dạo phố đèn lồng Hội An, tham quan hội quán và chùa cổ, thử đặt may trang phục, lớp học nấu ăn ven sông Thu Bồn.',
      location: 'Hội An',
      price: 2200000,
      capacity: 20,
      image: IMG.hoian,
    },
  ];

  const tours = [];
  for (const t of toursPayload) {
    const created = await request('/tours', { method: 'POST', body: JSON.stringify(t) });
    tours.push(created);
  }
  console.log(`   ✅ Created ${tours.length} tours`);

  // ── Blog Posts ───────────────────────────────────────────────────
  console.log('\n📝 Creating blog posts...');

  const BLOG_IMG = {
    beach:      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop',
    halong:     'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&auto=format&fit=crop',
    food:       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop',
    travel:     'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop',
    phuquoc:    'https://images.unsplash.com/photo-1568819317551-31051b37f69f?w=900&auto=format&fit=crop',
    eco:        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&auto=format&fit=crop',
    sapa:       'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=900&auto=format&fit=crop',
    dalat:      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=900&auto=format&fit=crop',
    mekong:     'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=900&auto=format&fit=crop',
    hue:        'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=900&auto=format&fit=crop',
    hoian:      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&auto=format&fit=crop',
    danang:     'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&auto=format&fit=crop',
    nhatrang:   'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&auto=format&fit=crop',
    ninhbinh:   'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&auto=format&fit=crop',
    cooking:    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop',
    budget:     'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&auto=format&fit=crop',
    photo:      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&auto=format&fit=crop',
    visa:       'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&auto=format&fit=crop',
    culture:    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=900&auto=format&fit=crop',
  };

  const postsPayload = [
    {
      title: 'Top 10 Bãi Biển Ẩn Mình Đẹp Nhất Việt Nam - Hướng Dẫn Đầy Đủ',
      content: 'Khám phá những bãi biển đẹp nhất và ít đông đúc nhất Việt Nam. Từ cát trắng mịn đến làn nước trong vắt, những viên ngọc ẩn này là lựa chọn hoàn hảo cho kỳ nghỉ bình yên. Bao gồm gợi ý chỗ ở, ẩm thực địa phương và các hoạt động dưới nước tại mỗi bãi biển.',
      authorId: users[0]._id,
      image: BLOG_IMG.beach,
      tags: ['beach', 'travel', 'vietnam'],
    },
    {
      title: 'Lịch Trình 3 Ngày Vịnh Hạ Long Cho Người Lần Đầu Đến',
      content: 'Lên kế hoạch cho chuyến đi Hạ Long đầu tiên? Lịch trình chi tiết này bao gồm các lựa chọn du thuyền tốt nhất, hang động và đảo không thể bỏ qua, ẩm thực địa phương nhất định phải thử, và những mẹo từ người trong nghề để tránh đông đúc.',
      authorId: users[1]._id,
      image: BLOG_IMG.halong,
      tags: ['halong', 'itinerary', 'must-visit'],
    },
    {
      title: 'Hành Trình Ẩm Thực Đường Phố Việt Nam: Khám Phá Văn Hóa Ăn Uống',
      content: 'Hướng dẫn toàn diện về văn hóa ẩm thực đường phố Việt Nam. Từ phở và bánh mì đến bánh xèo và nem cuốn, khám phá lịch sử và cách chế biến các món ăn Việt Nam biểu tượng. Tìm hiểu nơi tìm hàng ngon nhất và cách ăn an toàn tại các quán vỉa hè.',
      authorId: users[2]._id,
      image: BLOG_IMG.food,
      tags: ['food', 'culture', 'vietnam'],
    },
    {
      title: 'Khi Nào Nên Đến Việt Nam: Hướng Dẫn Du Lịch Theo Mùa 2025',
      content: 'Lên kế hoạch đến Việt Nam? Hướng dẫn toàn diện này giúp bạn chọn thời điểm tốt nhất dựa trên thời tiết, lễ hội và mùa du lịch theo từng vùng. Bao gồm thông tin chi tiết về mùa mưa, bão và biến đổi vùng miền ảnh hưởng đến chuyến đi của bạn.',
      authorId: users[3]._id,
      image: BLOG_IMG.travel,
      tags: ['weather', 'planning', 'tips'],
    },
    {
      title: 'Phú Quốc: Hòn Ngọc Việt Nam - Hướng Dẫn Khám Phá Đầy Đủ',
      content: 'Khám phá đảo Phú Quốc, nổi tiếng với bãi biển nguyên sơ, thể thao nước và cuộc sống về đêm sôi động. Hướng dẫn toàn diện này bao gồm các điểm tham quan nổi bật như bãi Sao, chợ đêm, trang trại ngọc trai, nhà hàng ngon nhất và tùy chọn chỗ ở cho mọi ngân sách.',
      authorId: users[4]._id,
      image: BLOG_IMG.phuquoc,
      tags: ['phu-quoc', 'island', 'beaches'],
    },
    {
      title: 'Du Lịch Bền Vững Tại Việt Nam: Hãy Đi Du Lịch Có Trách Nhiệm',
      content: 'Cách du lịch có trách nhiệm ở Việt Nam trong khi hỗ trợ cộng đồng địa phương. Khám phá các chỗ ở thân thiện môi trường, nhà điều hành du lịch bền vững, tương tác động vật có đạo đức và cách giảm thiểu tác động môi trường.',
      authorId: users[0]._id,
      image: BLOG_IMG.eco,
      tags: ['sustainability', 'eco-tourism', 'responsible-travel'],
    },
    {
      title: 'Trekking Sapa: Khám Phá Vùng Cao Nguyên Việt Nam',
      content: 'Hướng dẫn đầy đủ về trekking ở Sapa với mô tả chi tiết các tuyến đường, mức độ khó, mùa tốt nhất và cần mang gì. Khám phá bản làng dân tộc thiểu số, tìm hiểu văn hóa H\'Mông và Dao, ngủ homestay và trải nghiệm ruộng bậc thang ngoạn mục.',
      authorId: users[1]._id,
      image: BLOG_IMG.sapa,
      tags: ['trekking', 'mountains', 'adventure'],
    },
    {
      title: 'Đà Lạt: Thành Phố Ngàn Hoa - Điểm Đến Lãng Mạn Quanh Năm',
      content: 'Khám phá Đà Lạt lãng mạn với kiến trúc Pháp cổ, khí hậu mát mẻ và vườn cà phê. Khám phá Đà Lạt Palace, Thung lũng Tình Yêu, hồ Xuân Hương và ghé thăm chợ hoa. Điểm đến lý tưởng cho các cặp đôi và người yêu thiên nhiên tìm kiếm một nơi thư giãn bình yên.',
      authorId: users[2]._id,
      image: BLOG_IMG.dalat,
      tags: ['dalat', 'romantic', 'nature'],
    },
    {
      title: 'Chợ Nổi Mekong: Trải Nghiệm Việt Nam Đích Thực',
      content: 'Khám phá các chợ nổi sôi động của Đồng bằng sông Cửu Long. Trải nghiệm tour thuyền lúc bình minh, tham quan nhà máy kẹo dừa, tìm hiểu làm bún gạo, ở cùng gia đình địa phương và thưởng thức ẩm thực vùng. Bao gồm mẹo chụp ảnh đẹp và giờ mở cửa chợ.',
      authorId: users[3]._id,
      image: BLOG_IMG.mekong,
      tags: ['mekong', 'markets', 'culture'],
    },
    {
      title: 'Huế: Kinh Đô Cổ Kính - Di Sản Triều Nguyễn',
      content: 'Khám phá Di sản Thế giới UNESCO Huế. Tham quan Hoàng thành và cung điện, khám phá lăng tẩm hoàng gia, tour thuyền sông Hương, trải nghiệm ẩm thực cung đình và tìm hiểu lịch sử văn hóa Việt Nam thời triều Nguyễn.',
      authorId: users[4]._id,
      image: BLOG_IMG.hue,
      tags: ['hue', 'history', 'culture'],
    },
    {
      title: 'Phố Cổ Hội An: Bước Chân Vào Ký Ức',
      content: 'Ngược dòng thời gian trong những con phố đèn lồng của Hội An. Khám phá kiến trúc phố cổ, tham quan hội quán và chùa, thử đặt may trang phục truyền thống, tham gia lớp học nấu ăn và thưởng thức ẩm thực ven sông. Bao gồm mẹo chụp ảnh thực tế và cách tránh đông đúc.',
      authorId: users[0]._id,
      image: BLOG_IMG.hoian,
      tags: ['hoian', 'ancient-town', 'photography'],
    },
    {
      title: 'Đà Nẵng: Thành Phố Hiện Đại Giữa Thiên Nhiên Biển',
      content: 'Khám phá Đà Nẵng, thành phố phát triển nhanh nhất Việt Nam. Tham quan bãi Mỹ Khê, leo Ngũ Hành Sơn, trải nghiệm thể thao nước và tận hưởng cuộc sống về đêm sôi động tại chợ Hàn. Điểm đến lý tưởng cho người yêu biển và phiêu lưu.',
      authorId: users[1]._id,
      image: BLOG_IMG.danang,
      tags: ['danang', 'beaches', 'city'],
    },
    {
      title: 'Nha Trang: Thiên Đường Biển Hàng Đầu Việt Nam',
      content: 'Hướng dẫn toàn diện về Nha Trang với tour đảo Mun và Mốt, lặn ngắm san hô, tham quan bảo tàng dưới nước, thưởng thức hải sản tươi sống và trải nghiệm cuộc sống về đêm. Cộng thêm mẹo từ người trong nghề về chỗ ở tốt nhất và nhà hàng ngon.',
      authorId: users[2]._id,
      image: BLOG_IMG.nhatrang,
      tags: ['nhatrang', 'snorkeling', 'beaches'],
    },
    {
      title: 'Ninh Bình: Vẻ Đẹp Kỳ Vĩ Của Vùng Núi Đá Vôi',
      content: 'Khám phá phong cảnh núi đá vôi Ninh Bình qua tour thuyền Tam Cốc và đạp xe. Leo Hang Múa ngắm toàn cảnh, tham quan hệ thống hang động, đạp xe qua cánh đồng lúa và nghỉ tại homestay địa phương. Thiên đường của nhiếp ảnh gia với ít khách du lịch hơn Hạ Long.',
      authorId: users[3]._id,
      image: BLOG_IMG.ninhbinh,
      tags: ['ninhbinh', 'nature', 'photography'],
    },
    {
      title: 'Lớp Học Nấu Ăn Việt Nam: Học Nấu Như Người Bản Địa',
      content: 'Khám phá các lớp học nấu ăn tốt nhất trên khắp Việt Nam từ Hà Nội đến TP. Hồ Chí Minh. Học công thức địa phương, mua sắm ở chợ địa phương, nấu với nguyên liệu tươi và thưởng thức món ăn do chính mình làm. Bao gồm gợi ý lớp học thân thiện với gia đình.',
      authorId: users[4]._id,
      image: BLOG_IMG.cooking,
      tags: ['cooking', 'culture', 'experience'],
    },
    {
      title: 'Du Lịch Tiết Kiệm Tại Việt Nam: Hướng Dẫn Tiết Kiệm Chi Phí',
      content: 'Du lịch Việt Nam với ngân sách ít với hướng dẫn toàn diện này. Tìm hiểu các phương tiện di chuyển, chỗ ở giá rẻ, ẩm thực đường phố, điểm tham quan miễn phí và cách tránh bẫy du lịch. Bao gồm ngân sách hàng ngày cho dân phượt và mẹo tiết kiệm thực tế.',
      authorId: users[0]._id,
      image: BLOG_IMG.budget,
      tags: ['budget', 'travel-tips', 'money'],
    },
    {
      title: 'Hướng Dẫn Chụp Ảnh Du Lịch Việt Nam: Ghi Lại Khoảnh Khắc Hoàn Hảo',
      content: 'Hướng dẫn chụp ảnh thiết yếu cho du khách Việt Nam. Khám phá các địa điểm chụp ảnh đẹp nhất lúc bình minh và hoàng hôn, học kỹ thuật bố cục, hiểu ánh sáng nhiệt đới và nhận gợi ý kỹ thuật cho các loại máy ảnh khác nhau. Bao gồm tọa độ địa điểm.',
      authorId: users[1]._id,
      image: BLOG_IMG.photo,
      tags: ['photography', 'tips', 'guide'],
    },
    {
      title: 'Visa Việt Nam: Tất Cả Những Gì Bạn Cần Biết',
      content: 'Hướng dẫn visa đầy đủ cho du khách đến Việt Nam. Hiểu các loại visa (du lịch, kinh doanh, e-visa), quy trình đăng ký, tài liệu cần thiết, thời gian xử lý, chi phí và các câu hỏi thường gặp. Thông tin cập nhật về yêu cầu và quy định visa năm 2025.',
      authorId: users[2]._id,
      image: BLOG_IMG.visa,
      tags: ['visa', 'documentation', 'travel-tips'],
    },
    {
      title: 'Văn Hóa và Phong Tục Việt Nam: Mẹo Ứng Xử Khi Du Lịch',
      content: 'Tìm hiểu các chuẩn mực văn hóa và phong tục Việt Nam để thể hiện sự tôn trọng khi du lịch. Hiểu phong tục tại đền chùa, cách chào hỏi, nghi lễ ăn uống, nhiếp ảnh và hành vi ứng xử. Mẹo thực tế để tương tác tôn trọng với người địa phương và tránh hiểu lầm văn hóa.',
      authorId: users[4]._id,
      image: BLOG_IMG.culture,
      tags: ['culture', 'etiquette', 'customs'],
    },
  ];

  const posts = [];
  for (const p of postsPayload) {
    const created = await request('/blog-post', { method: 'POST', body: JSON.stringify(p) });
    posts.push(created);
  }
  console.log(`   ✅ Created ${posts.length} blog posts`);

  // ── Blog Comments ────────────────────────────────────────────────
  console.log('\n💬 Creating blog comments...');
  const commentsPayload = [
    { postId: posts[0]._id,  userId: users[1]._id, content: 'Bài viết rất hữu ích! Tôi đã đi thăm 5 bãi biển trong danh sách này và chúng thật sự tuyệt vời.' },
    { postId: posts[0]._id,  userId: users[2]._id, content: 'Đã lưu lại để đi hè năm nay. Cảm ơn admin đã chia sẻ!' },
    { postId: posts[0]._id,  userId: users[3]._id, content: 'Hình ảnh đẹp quá, mình chắc chắn sẽ ghé những chỗ này trong chuyến đi tới.' },
    { postId: posts[1]._id,  userId: users[0]._id, content: 'Lịch trình hợp lý và chi tiết, cảm ơn bạn đã chia sẻ!' },
    { postId: posts[1]._id,  userId: users[4]._id, content: 'Mình sẽ theo lịch trình này cho chuyến đi tháng 9 năm nay.' },
    { postId: posts[2]._id,  userId: users[3]._id, content: 'Món nào cũng ngon! Mình thích nhất là bánh xèo và bún bò Huế.' },
    { postId: posts[2]._id,  userId: users[5]._id, content: 'Giới thiệu chi tiết về các món ăn đường phố tuyệt vời! Đã thử hết rồi.' },
    { postId: posts[3]._id,  userId: users[1]._id, content: 'Tips rất thực tế, sẽ áp dụng cho chuyến đi tiếp theo của mình.' },
    { postId: posts[4]._id,  userId: users[6]._id, content: 'Phú Quốc quả là thiên đường biển xanh cát trắng!' },
    { postId: posts[5]._id,  userId: users[2]._id, content: 'Du lịch bền vững rất quan trọng, cảm ơn đã nhắc nhở mọi người.' },
    { postId: posts[6]._id,  userId: users[7]._id, content: 'Trekking ở Sapa thú vị lắm, bài viết rất chi tiết và hữu ích.' },
    { postId: posts[7]._id,  userId: users[3]._id, content: 'Đà Lạt quả là lãng mạn, hoàn hảo cho chuyến trăng mật của tụi mình.' },
    { postId: posts[8]._id,  userId: users[4]._id, content: 'Chợ nổi Cần Thơ đẹp lắm, mình đã đi rồi và cảm giác rất khác biệt.' },
    { postId: posts[9]._id,  userId: users[2]._id, content: 'Huế ẩm thực ngon không kém gì cảnh đẹp, nhất định phải thử bún bò!' },
    { postId: posts[10]._id, userId: users[5]._id, content: 'Hội An buổi tối thắp đèn lồng thật sự rất đẹp và lãng mạn.' },
    { postId: posts[11]._id, userId: users[1]._id, content: 'Cầu Rồng Đà Nẵng phun lửa rất ấn tượng, đừng bỏ lỡ cuối tuần.' },
    { postId: posts[12]._id, userId: users[6]._id, content: 'Nha Trang lặn biển tuyệt vời, san hô tươi tốt và cá rất đẹp!' },
  ];
  for (const c of commentsPayload) {
    try {
      // blog-comment POST is mapped to /blog/comments in gateway, which expects postId/userId/content
      await request('/blog-comment', { method: 'POST', body: JSON.stringify(c) });
    } catch {
      // continue on error
    }
  }
  console.log(`   ✅ Created ${commentsPayload.length} comments`);

  // ── Reviews ──────────────────────────────────────────────────────
  console.log('\n⭐ Creating reviews...');
  // Reviews service uses: userId, tourId, rating, comment
  const reviewsPayload = [
    { userId: users[1]._id, tourId: tours[0]._id,  rating: 5, comment: 'Tour Hạ Long tuyệt vời! Du thuyền sang trọng, hướng dẫn viên nhiệt tình và chuyên nghiệp. Nhất định sẽ quay lại!' },
    { userId: users[2]._id, tourId: tours[0]._id,  rating: 4, comment: 'Dịch vụ tốt, phục vụ chu đáo. Cảnh quan vịnh Hạ Long thật sự tuyệt đẹp.' },
    { userId: users[3]._id, tourId: tours[1]._id,  rating: 5, comment: 'Tour giá rẻ nhưng chất lượng không thua gì tour đắt đỏ, rất hài lòng!' },
    { userId: users[1]._id, tourId: tours[2]._id,  rating: 5, comment: 'Phú Quốc quả là thiên đường. Biển xanh, cát trắng, người địa phương thân thiện.' },
    { userId: users[4]._id, tourId: tours[2]._id,  rating: 4, comment: 'Tour tuyệt vời, đã tạo ra những kỷ niệm đẹp với gia đình. Con bé nhà mình rất thích!' },
    { userId: users[2]._id, tourId: tours[3]._id,  rating: 5, comment: 'Phú Quốc lần 2 mà vẫn tuyệt vời! Khác biệt trong cách trải nghiệm lần này.' },
    { userId: users[5]._id, tourId: tours[4]._id,  rating: 5, comment: 'Đà Nẵng - Hội An, lịch trình hợp lý và hướng dẫn viên rất tận tâm.' },
    { userId: users[3]._id, tourId: tours[5]._id,  rating: 4, comment: 'Đà Nẵng biển đẹp, dịch vụ tốt, giá cả hợp lý. Sẽ giới thiệu cho bạn bè.' },
    { userId: users[6]._id, tourId: tours[6]._id,  rating: 5, comment: 'Huế lịch sử, cung điện hoàng gia tuyệt đẹp. Hướng dẫn viên rất am hiểu lịch sử.' },
    { userId: users[1]._id, tourId: tours[7]._id,  rating: 5, comment: 'Huế - Hội An 4 ngày 3 đêm, chuyến đi hoàn hảo nhất mình từng tham gia!' },
    { userId: users[2]._id, tourId: tours[8]._id,  rating: 5, comment: 'Nha Trang lặn biển tuyệt vời, san hô tươi tốt, cá rất đẹp và nhiều màu sắc.' },
    { userId: users[7]._id, tourId: tours[9]._id,  rating: 4, comment: 'Nha Trang vui vẻ, bãi biển sạch sẽ, ăn uống tốt với hải sản tươi ngon.' },
    { userId: users[3]._id, tourId: tours[10]._id, rating: 5, comment: 'Đồng bằng sông Cửu Long đẹp lắm, chợ nổi tấp nập, ẩm thực phong phú đặc sắc.' },
    { userId: users[4]._id, tourId: tours[11]._id, rating: 5, comment: 'Trekking Sapa tuyệt vời, cảnh đẹp từng bước chân, dân tộc thiểu số rất thân thiện.' },
    { userId: users[5]._id, tourId: tours[12]._id, rating: 5, comment: 'Cáp treo Fansipan, trekking qua đám mây trắng, kỷ niệm không thể quên trong đời.' },
    { userId: users[6]._id, tourId: tours[13]._id, rating: 5, comment: 'Đà Lạt lãng mạn quá, thời tiết mát mẻ dễ chịu, hoa nở khắp nơi rất đẹp.' },
    { userId: users[2]._id, tourId: tours[14]._id, rating: 5, comment: 'Ninh Bình cảnh đẹp như tranh vẽ. Tam Cốc nhìn từ trên thuyền tuyệt đẹp không tả được!' },
    { userId: users[7]._id, tourId: tours[15]._id, rating: 5, comment: 'Phố cổ Hội An về đêm đẹp lắm, đèn lồng phản chiếu xuống sông Thu Bồn cực kỳ thơ mộng.' },
  ];
  let reviewsOk = 0;
  for (const r of reviewsPayload) {
    try {
      await request('/reviews', { method: 'POST', body: JSON.stringify(r) });
      reviewsOk++;
    } catch (e) {
      console.warn(`   ⚠️  Review failed: ${e.message}`);
    }
  }
  console.log(`   ✅ Created ${reviewsOk}/${reviewsPayload.length} reviews`);

  // ── Bookings ─────────────────────────────────────────────────────
  // Booking service uses: userId, tourId, numberOfGuests, totalPrice, status (pending|confirmed|cancelled)
  // POST via gateway: /booking → rewritten to /bookings
  console.log('\n📅 Creating bookings...');
  const bookingsPayload = [
    { userId: users[1]._id, tourId: tours[0]._id,  numberOfGuests: 2, totalPrice: tours[0].price * 2,  status: 'confirmed' },
    { userId: users[2]._id, tourId: tours[1]._id,  numberOfGuests: 3, totalPrice: tours[1].price * 3,  status: 'pending'   },
    { userId: users[3]._id, tourId: tours[2]._id,  numberOfGuests: 1, totalPrice: tours[2].price,      status: 'confirmed' },
    { userId: users[1]._id, tourId: tours[3]._id,  numberOfGuests: 4, totalPrice: tours[3].price * 4,  status: 'confirmed' },
    { userId: users[4]._id, tourId: tours[4]._id,  numberOfGuests: 2, totalPrice: tours[4].price * 2,  status: 'pending'   },
    { userId: users[5]._id, tourId: tours[5]._id,  numberOfGuests: 3, totalPrice: tours[5].price * 3,  status: 'confirmed' },
    { userId: users[6]._id, tourId: tours[6]._id,  numberOfGuests: 1, totalPrice: tours[6].price,      status: 'confirmed' },
    { userId: users[3]._id, tourId: tours[7]._id,  numberOfGuests: 2, totalPrice: tours[7].price * 2,  status: 'confirmed' },
    { userId: users[7]._id, tourId: tours[8]._id,  numberOfGuests: 3, totalPrice: tours[8].price * 3,  status: 'pending'   },
    { userId: users[2]._id, tourId: tours[9]._id,  numberOfGuests: 2, totalPrice: tours[9].price * 2,  status: 'confirmed' },
    { userId: users[4]._id, tourId: tours[10]._id, numberOfGuests: 1, totalPrice: tours[10].price,     status: 'confirmed' },
    { userId: users[5]._id, tourId: tours[11]._id, numberOfGuests: 4, totalPrice: tours[11].price * 4, status: 'pending'   },
    { userId: users[1]._id, tourId: tours[12]._id, numberOfGuests: 2, totalPrice: tours[12].price * 2, status: 'confirmed' },
    { userId: users[6]._id, tourId: tours[13]._id, numberOfGuests: 2, totalPrice: tours[13].price * 2, status: 'cancelled' },
    { userId: users[3]._id, tourId: tours[14]._id, numberOfGuests: 3, totalPrice: tours[14].price * 3, status: 'confirmed' },
    { userId: users[7]._id, tourId: tours[15]._id, numberOfGuests: 2, totalPrice: tours[15].price * 2, status: 'pending'   },
  ];
  let bookingsOk = 0;
  for (const b of bookingsPayload) {
    try {
      // POST /booking → gateway rewrites to POST /bookings (bookings-service)
      await request('/bookings', { method: 'POST', body: JSON.stringify(b) });
      bookingsOk++;
    } catch (e) {
      console.warn(`   ⚠️  Booking failed: ${e.message}`);
    }
  }
  console.log(`   ✅ Created ${bookingsOk}/${bookingsPayload.length} bookings`);

  // ── Summary ──────────────────────────────────────────────────────
  console.log('\n📊 Verifying seed counts...');
  const usersCount    = (await request('/users')).length;
  const toursCount    = (await request('/tours')).length;
  const blogsCount    = (await request('/blog-post')).length;
  // /bookings returns all bookings (no userId filter = all)
  const bookingsCount = (await request('/bookings')).length;
  // /reviews?tourId=... needed to filter; without param gateway returns all
  const reviewsArr    = await request('/reviews').catch(() => []);
  const reviewsCount  = Array.isArray(reviewsArr) ? reviewsArr.length : '?';

  console.log('\n✅ Seed completed:');
  console.table({ users: usersCount, tours: toursCount, blogs: blogsCount, bookings: bookingsCount, reviews: reviewsCount });

  // ── Verify admin login ───────────────────────────────────────────
  console.log('\n🔐 Verifying admin login...');
  try {
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: '123456' }),
    });
    if (loginRes?.access_token) {
      console.log('   ✅ Admin login OK  →  email: admin@example.com  |  password: 123456');
      console.log(`   👤 Role: ${loginRes.user?.role ?? 'N/A'}`);
    } else {
      console.warn('   ⚠️  Login returned no token:', JSON.stringify(loginRes));
    }
  } catch (err) {
    console.error('   ❌ Admin login FAILED:', err.message);
    console.error('   ➡️  Check that auth-service can reach users-service at USERS_SERVICE_URL');
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
