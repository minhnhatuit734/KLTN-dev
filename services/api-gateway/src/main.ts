import express, { Express, Request, Response } from 'express';
import axios from 'axios';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service URLs
const serviceUrls = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
  tours: process.env.TOURS_SERVICE_URL || 'http://localhost:3003',
  bookings: process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3004',
  reviews: process.env.REVIEWS_SERVICE_URL || 'http://localhost:3005',
  blog: process.env.BLOG_SERVICE_URL || 'http://localhost:3006',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:3007',
};

type AnyData = Record<string, any>;

function mapLegacyRequestBody(rewrittenPath: string, method: string, body: any): any {
  if (!body || typeof body !== 'object') return body;
  const upper = method.toUpperCase();
  const mapped: AnyData = { ...body };

  if (rewrittenPath.startsWith('/bookings') && (upper === 'POST' || upper === 'PATCH')) {
    if (mapped.user && !mapped.userId) mapped.userId = mapped.user;
    if (mapped.tour && !mapped.tourId) mapped.tourId = mapped.tour;
    if (mapped.num_people !== undefined && mapped.numberOfGuests === undefined) {
      mapped.numberOfGuests = mapped.num_people;
    }
    if (mapped.total_price !== undefined && mapped.totalPrice === undefined) {
      mapped.totalPrice = mapped.total_price;
    }
  }

  if (rewrittenPath.startsWith('/reviews') && (upper === 'POST' || upper === 'PATCH')) {
    if (mapped.user && !mapped.userId) mapped.userId = mapped.user;
    if (mapped.tour && !mapped.tourId) mapped.tourId = mapped.tour;
    if (mapped.content && !mapped.comment) mapped.comment = mapped.content;
  }

  if (rewrittenPath.startsWith('/blog/posts') && (upper === 'POST' || upper === 'PATCH')) {
    if (mapped.author && !mapped.authorId) mapped.authorId = mapped.author;
  }

  if (rewrittenPath === '/blog/comments' && upper === 'POST') {
    if (mapped.post && !mapped.postId) mapped.postId = mapped.post;
    if (mapped.user && !mapped.userId) mapped.userId = mapped.user;
    if (mapped.comment && !mapped.content) mapped.content = mapped.comment;
  }

  return mapped;
}

function toLegacyBookingShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    user: raw.user ?? raw.userId ?? null,
    tour: raw.tour ?? raw.tourId ?? null,
    num_people: raw.num_people ?? raw.numberOfGuests ?? 0,
    total_price: raw.total_price ?? raw.totalPrice ?? 0,
  };
}

function toLegacyReviewShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    user: raw.user ?? raw.userId ?? null,
    tour: raw.tour ?? raw.tourId ?? null,
    content: raw.content ?? raw.comment ?? '',
  };
}

function toLegacyBlogPostShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    author: raw.author ?? raw.authorId ?? null,
  };
}

function toLegacyBlogCommentShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    user: raw.user ?? raw.userId ?? null,
    post: raw.post ?? raw.postId ?? null,
    comment: raw.comment ?? raw.content ?? '',
  };
}

async function enrichBookings(data: AnyData[] | AnyData): Promise<AnyData[] | AnyData> {
  const list = Array.isArray(data) ? data : [data];
  const normalized = list.map(toLegacyBookingShape);

  const userIds = Array.from(
    new Set(
      normalized
        .map((b) => (typeof b.user === 'string' ? b.user : b.user?._id))
        .filter(Boolean),
    ),
  );
  const tourIds = Array.from(
    new Set(
      normalized
        .map((b) => (typeof b.tour === 'string' ? b.tour : b.tour?._id))
        .filter(Boolean),
    ),
  );

  const userMap = new Map<string, AnyData>();
  const tourMap = new Map<string, AnyData>();

  await Promise.all(
    userIds.map(async (id) => {
      try {
        const resp = await axios.get(`${serviceUrls.users}/users/${id}`, {
          validateStatus: () => true,
        });
        if (resp.status < 400 && resp.data) userMap.set(id as string, resp.data);
      } catch {
        // ignore enrichment failures
      }
    }),
  );

  await Promise.all(
    tourIds.map(async (id) => {
      try {
        const resp = await axios.get(`${serviceUrls.tours}/tours/${id}`, {
          validateStatus: () => true,
        });
        if (resp.status < 400 && resp.data) tourMap.set(id as string, resp.data);
      } catch {
        // ignore enrichment failures
      }
    }),
  );

  const enriched = normalized.map((b) => {
    const userId = typeof b.user === 'string' ? b.user : b.user?._id;
    const tourId = typeof b.tour === 'string' ? b.tour : b.tour?._id;
    return {
      ...b,
      user: userMap.get(userId) || b.user,
      tour: tourMap.get(tourId) || b.tour,
    };
  });

  return Array.isArray(data) ? enriched : enriched[0];
}

async function mapLegacyResponse(
  originalPath: string,
  method: string,
  data: any,
): Promise<any> {
  if (!data) return data;
  const upper = method.toUpperCase();

  if (originalPath.startsWith('/booking')) {
    if (upper === 'GET') return enrichBookings(data);
    if (Array.isArray(data)) return data.map(toLegacyBookingShape);
    return toLegacyBookingShape(data);
  }

  if (originalPath.startsWith('/reviews')) {
    if (Array.isArray(data)) return data.map(toLegacyReviewShape);
    return toLegacyReviewShape(data);
  }

  if (originalPath.startsWith('/blog-post')) {
    if (Array.isArray(data)) return data.map(toLegacyBlogPostShape);
    return toLegacyBlogPostShape(data);
  }

  if (originalPath.startsWith('/blog-comment')) {
    if (Array.isArray(data)) return data.map(toLegacyBlogCommentShape);
    return toLegacyBlogCommentShape(data);
  }

  return data;
}

function rewriteLegacyRequest(req: Request): string {
  let path = req.path;
  const params = new URLSearchParams(req.query as Record<string, string>);

  if (path === '/auth/forgot') {
    path = '/auth/forgot-password';
  } else if (path.startsWith('/booking/user/')) {
    const userId = path.replace('/booking/user/', '');
    path = '/bookings';
    params.set('userId', userId);
  } else if (path.startsWith('/booking')) {
    path = path.replace('/booking', '/bookings');
  } else if (path === '/blog-post' || path.startsWith('/blog-post/')) {
    path = path.replace('/blog-post', '/blog/posts');
  } else if (path === '/blog-comment' && req.method.toUpperCase() === 'GET') {
    const postId = params.get('post');
    if (postId) {
      path = `/blog/posts/${postId}/comments`;
      params.delete('post');
    }
  } else if (
    path === '/blog-comment' &&
    req.method.toUpperCase() === 'POST'
  ) {
    path = '/blog/comments';
  } else if (path === '/reviews') {
    const tour = params.get('tour');
    if (tour) {
      params.set('tourId', tour);
      params.delete('tour');
    }
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

// Gateway middleware - routes all requests to appropriate services
app.all('*', async (req: Request, res: Response) => {
  const originalPath = req.path;
  const rewrittenPath = rewriteLegacyRequest(req);
  const path = rewrittenPath.split('?')[0].split('/')[1];
  let serviceUrl = serviceUrls.auth;

  if (path === 'users') serviceUrl = serviceUrls.users;
  else if (path === 'tours') serviceUrl = serviceUrls.tours;
  else if (path === 'bookings') serviceUrl = serviceUrls.bookings;
  else if (path === 'reviews') serviceUrl = serviceUrls.reviews;
  else if (path === 'blog') serviceUrl = serviceUrls.blog;
  else if (path === 'chat') serviceUrl = serviceUrls.chat;

  const fullUrl = `${serviceUrl}${rewrittenPath}`;
  const mappedBody = mapLegacyRequestBody(rewrittenPath.split('?')[0], req.method, req.body);
  const forwardedHeaders = { ...req.headers } as Record<string, any>;
  delete forwardedHeaders.host;
  delete forwardedHeaders['content-length'];
  delete forwardedHeaders.connection;

  try {
    const response = await axios({
      method: req.method.toLowerCase() as any,
      url: fullUrl,
      data: mappedBody,
      headers: forwardedHeaders,
      validateStatus: () => true,
    });
    const mappedResponse = await mapLegacyResponse(
      originalPath,
      req.method,
      response.data,
    );
    res.status(response.status).send(mappedResponse);
  } catch (error: any) {
    res.status(500).json({
      error: 'Gateway error',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
  console.log(`- Auth Service: ${serviceUrls.auth}`);
  console.log(`- Users Service: ${serviceUrls.users}`);
  console.log(`- Tours Service: ${serviceUrls.tours}`);
  console.log(`- Bookings Service: ${serviceUrls.bookings}`);
  console.log(`- Reviews Service: ${serviceUrls.reviews}`);
  console.log(`- Blog Service: ${serviceUrls.blog}`);
  console.log(`- Chat Service: ${serviceUrls.chat}`);
});
