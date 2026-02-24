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
  const rows = await request(listPath);
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
  console.log(`Seeding via ${API_BASE}`);

  await clearByList('/users');
  await clearByList('/tours');
  await clearByList('/booking');
  await clearByList('/reviews');
  await clearByList('/blog-post');

  const usersPayload = [
    { name: 'Admin User', email: 'admin@example.com', password: '123456', role: 'admin', phone: '0900000001' },
    { name: 'Nguyen Van A', email: 'user1@example.com', password: '123456', role: 'user', phone: '0900000002' },
    { name: 'Tran Thi B', email: 'user2@example.com', password: '123456', role: 'user', phone: '0900000003' },
    { name: 'Le Van C', email: 'user3@example.com', password: '123456', role: 'user', phone: '0900000004' },
  ];
  const users = [];
  for (const u of usersPayload) users.push(await request('/users', { method: 'POST', body: JSON.stringify(u) }));

  const toursPayload = [
    { title: 'Ha Long Bay Escape 3N2D', description: 'Cruise, kayaking, cave exploration', location: 'Ha Long', price: 320, capacity: 25, image: '/images/default_tour.jpg' },
    { title: 'Phu Quoc Beach Holiday', description: 'Island hopping and seafood', location: 'Phu Quoc', price: 450, capacity: 20, image: '/images/default_tour.jpg' },
    { title: 'Da Nang - Hoi An Combo', description: 'City and old town adventure', location: 'Da Nang', price: 280, capacity: 22, image: '/images/default_tour.jpg' },
    { title: 'Hue Heritage Tour', description: 'Imperial city and local cuisine', location: 'Hue', price: 240, capacity: 18, image: '/images/default_tour.jpg' },
    { title: 'Nha Trang Seaside Fun', description: 'Beach, snorkeling and island tour', location: 'Nha Trang', price: 350, capacity: 24, image: '/images/default_tour.jpg' },
    { title: 'Mekong Delta Discovery', description: 'Canals, floating markets and villages', location: 'Can Tho', price: 210, capacity: 16, image: '/images/default_tour.jpg' },
    { title: 'Sapa Mountain Trek', description: 'Rice terraces and ethnic villages', location: 'Sapa', price: 390, capacity: 15, image: '/images/default_tour.jpg' },
    { title: 'Da Lat Chill Trip', description: 'Pine hills and coffee spots', location: 'Da Lat', price: 260, capacity: 20, image: '/images/default_tour.jpg' },
  ];
  const tours = [];
  for (const t of toursPayload) tours.push(await request('/tours', { method: 'POST', body: JSON.stringify(t) }));

  const postsPayload = [
    { title: 'Top 10 beaches in Vietnam', content: 'Danh sach bai bien dep de di mua he.', author: users[0]._id, image: '/images/default_blog.jpg', tags: ['beach', 'travel'] },
    { title: '3-day Ha Long itinerary', content: 'Lich trinh chi tiet cho nguoi moi.', author: users[1]._id, image: '/images/default_blog.jpg', tags: ['halong', 'itinerary'] },
    { title: 'Street food checklist', content: 'Nhung mon an khong the bo qua.', author: users[2]._id, image: '/images/default_blog.jpg', tags: ['food', 'culture'] },
    { title: 'Budget travel tips', content: 'Meo tiet kiem chi phi khi di tour.', author: users[3]._id, image: '/images/default_blog.jpg', tags: ['budget', 'tips'] },
    { title: 'When to visit central Vietnam', content: 'Goi y theo mua va thoi tiet.', author: users[0]._id, image: '/images/default_blog.jpg', tags: ['weather', 'plan'] },
  ];
  const posts = [];
  for (const p of postsPayload) posts.push(await request('/blog-post', { method: 'POST', body: JSON.stringify(p) }));

  const commentsPayload = [
    { post: posts[0]._id, user: users[1]._id, comment: 'Bai viet rat huu ich!' },
    { post: posts[0]._id, user: users[2]._id, comment: 'Da luu lai de di he nay.' },
    { post: posts[1]._id, user: users[0]._id, comment: 'Lich trinh hop ly, cam on ban.' },
    { post: posts[2]._id, user: users[3]._id, comment: 'Mon nao cung ngon.' },
    { post: posts[3]._id, user: users[1]._id, comment: 'Tips rat thuc te.' },
  ];
  for (const c of commentsPayload) await request('/blog-comment', { method: 'POST', body: JSON.stringify(c) });

  const reviewsPayload = [
    { user: users[1]._id, tour: tours[0]._id, rating: 5, content: 'Tour dep, huong dan vien nhiet tinh.' },
    { user: users[2]._id, tour: tours[0]._id, rating: 4, content: 'Dich vu tot, se quay lai.' },
    { user: users[3]._id, tour: tours[1]._id, rating: 5, content: 'Phu Quoc qua tuyet voi.' },
    { user: users[1]._id, tour: tours[2]._id, rating: 4, content: 'Lich trinh hop ly, gia on.' },
    { user: users[2]._id, tour: tours[3]._id, rating: 5, content: 'Hue rat dang trai nghiem.' },
    { user: users[3]._id, tour: tours[4]._id, rating: 4, content: 'Nha Trang dep va vui.' },
  ];
  for (const r of reviewsPayload) await request('/reviews', { method: 'POST', body: JSON.stringify(r) });

  const bookingsPayload = [
    { user: users[1]._id, tour: tours[0]._id, num_people: 2, total_price: tours[0].price * 2, status: 'confirmed' },
    { user: users[2]._id, tour: tours[1]._id, num_people: 3, total_price: tours[1].price * 3, status: 'pending' },
    { user: users[3]._id, tour: tours[2]._id, num_people: 1, total_price: tours[2].price, status: 'confirmed' },
    { user: users[1]._id, tour: tours[3]._id, num_people: 2, total_price: tours[3].price * 2, status: 'cancelled' },
    { user: users[2]._id, tour: tours[4]._id, num_people: 4, total_price: tours[4].price * 4, status: 'pending' },
  ];
  for (const b of bookingsPayload) await request('/booking', { method: 'POST', body: JSON.stringify(b) });

  const usersCount = (await request('/users')).length;
  const toursCount = (await request('/tours')).length;
  const blogsCount = (await request('/blog-post')).length;
  const bookingsCount = (await request('/booking')).length;
  const reviewsCount = (await request('/reviews')).length;

  console.log('Seed completed:');
  console.log({ users: usersCount, tours: toursCount, blogs: blogsCount, bookings: bookingsCount, reviews: reviewsCount });
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
