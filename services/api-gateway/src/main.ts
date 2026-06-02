import express, { Express, Request, Response } from 'express';
import axios from 'axios';

const app: Express = express();
const PORT = process.env.PORT || 4000;

type AnyData = Record<string, any>;

const serviceUrls = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
  tours: process.env.TOURS_SERVICE_URL || 'http://localhost:3003',
  bookings: process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3004',
  reviews: process.env.REVIEWS_SERVICE_URL || 'http://localhost:3005',
  blog: process.env.BLOG_SERVICE_URL || 'http://localhost:3006',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:3007',
};

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'ok',
    message: 'KLTN API Gateway is running',
    routes: [
      '/health',
      '/auth',
      '/users',
      '/tours',
      '/bookings',
      '/booking',
      '/reviews',
      '/blog/posts',
      '/blog-post',
      '/blog-comment',
      '/chat',
      '/chat/rasa',
    ],
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    port: PORT,
    upstreams: serviceUrls,
  });
});

function isLegacyBookingPath(path: string): boolean {
  return path === '/booking' || path.startsWith('/booking/');
}

function isLegacyBlogPostPath(path: string): boolean {
  return path === '/blog-post' || path.startsWith('/blog-post/');
}

function isLegacyBlogCommentPath(path: string): boolean {
  return path === '/blog-comment' || path.startsWith('/blog-comment/');
}

function rewritePathPrefix(path: string, fromPrefix: string, toPrefix: string): string {
  if (path === fromPrefix) {
    return toPrefix;
  }

  if (path.startsWith(`${fromPrefix}/`)) {
    return `${toPrefix}${path.slice(fromPrefix.length)}`;
  }

  return path;
}

function buildQueryParams(query: Request['query']): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          params.append(key, String(item));
        }
      });
      return;
    }

    params.set(key, String(value));
  });

  return params;
}

function mapLegacyRequestBody(rewrittenPath: string, method: string, body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

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
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  return {
    ...raw,
    user: raw.user ?? raw.userId ?? null,
    tour: raw.tour ?? raw.tourId ?? null,
    num_people: raw.num_people ?? raw.numberOfGuests ?? 0,
    total_price: raw.total_price ?? raw.totalPrice ?? 0,
  };
}

function toLegacyReviewShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  return {
    ...raw,
    user: raw.user ?? raw.userId ?? null,
    tour: raw.tour ?? raw.tourId ?? null,
    content: raw.content ?? raw.comment ?? '',
  };
}

function toLegacyBlogPostShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  return {
    ...raw,
    author: raw.author ?? raw.authorId ?? null,
  };
}

function toLegacyBlogCommentShape(raw: AnyData): AnyData {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

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
        .map((booking) => (typeof booking.user === 'string' ? booking.user : booking.user?._id))
        .filter(Boolean),
    ),
  );

  const tourIds = Array.from(
    new Set(
      normalized
        .map((booking) => (typeof booking.tour === 'string' ? booking.tour : booking.tour?._id))
        .filter(Boolean),
    ),
  );

  const userMap = new Map<string, AnyData>();
  const tourMap = new Map<string, AnyData>();

  await Promise.all(
    userIds.map(async (id) => {
      try {
        const response = await axios.get(`${serviceUrls.users}/users/${id}`, {
          validateStatus: () => true,
        });

        if (response.status < 400 && response.data) {
          userMap.set(id as string, response.data);
        }
      } catch {
        // Ignore enrichment failures.
      }
    }),
  );

  await Promise.all(
    tourIds.map(async (id) => {
      try {
        const response = await axios.get(`${serviceUrls.tours}/tours/${id}`, {
          validateStatus: () => true,
        });

        if (response.status < 400 && response.data) {
          tourMap.set(id as string, response.data);
        }
      } catch {
        // Ignore enrichment failures.
      }
    }),
  );

  const enriched = normalized.map((booking) => {
    const userId = typeof booking.user === 'string' ? booking.user : booking.user?._id;
    const tourId = typeof booking.tour === 'string' ? booking.tour : booking.tour?._id;

    return {
      ...booking,
      user: userMap.get(userId) || booking.user,
      tour: tourMap.get(tourId) || booking.tour,
    };
  });

  return Array.isArray(data) ? enriched : enriched[0];
}

async function mapLegacyResponse(
  originalPath: string,
  method: string,
  data: any,
): Promise<any> {
  if (!data) {
    return data;
  }

  const upper = method.toUpperCase();

  if (isLegacyBookingPath(originalPath)) {
    if (upper === 'GET') {
      return enrichBookings(data);
    }

    if (Array.isArray(data)) {
      return data.map(toLegacyBookingShape);
    }

    return toLegacyBookingShape(data);
  }

  if (originalPath.startsWith('/reviews')) {
    if (Array.isArray(data)) {
      return data.map(toLegacyReviewShape);
    }

    return toLegacyReviewShape(data);
  }

  if (isLegacyBlogPostPath(originalPath)) {
    if (Array.isArray(data)) {
      return data.map(toLegacyBlogPostShape);
    }

    return toLegacyBlogPostShape(data);
  }

  if (isLegacyBlogCommentPath(originalPath)) {
    if (Array.isArray(data)) {
      return data.map(toLegacyBlogCommentShape);
    }

    return toLegacyBlogCommentShape(data);
  }

  return data;
}

function rewriteLegacyRequest(req: Request): string {
  let path = req.path;
  const method = req.method.toUpperCase();
  const params = buildQueryParams(req.query);

  if (path === '/auth/forgot') {
    path = '/auth/forgot-password';
  } else if (path.startsWith('/booking/user/')) {
    const userId = path.slice('/booking/user/'.length);
    path = '/bookings';

    if (userId) {
      params.set('userId', userId);
    }
  } else if (isLegacyBookingPath(path)) {
    path = rewritePathPrefix(path, '/booking', '/bookings');
  } else if (isLegacyBlogPostPath(path)) {
    path = rewritePathPrefix(path, '/blog-post', '/blog/posts');
  } else if (path === '/blog-comment' && method === 'GET') {
    const postId = params.get('post');

    if (postId) {
      path = `/blog/posts/${postId}/comments`;
      params.delete('post');
    }
  } else if (path === '/blog-comment' && method === 'POST') {
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

function getTargetServiceUrl(rewrittenPath: string): string | null {
  const resource = rewrittenPath.split('?')[0].split('/')[1];

  switch (resource) {
    case 'auth':
      return serviceUrls.auth;
    case 'users':
      return serviceUrls.users;
    case 'tours':
      return serviceUrls.tours;
    case 'bookings':
      return serviceUrls.bookings;
    case 'reviews':
      return serviceUrls.reviews;
    case 'blog':
      return serviceUrls.blog;
    case 'chat':
      return serviceUrls.chat;
    default:
      return null;
  }
}

app.all('*', async (req: Request, res: Response) => {
  const originalPath = req.path;
  const rewrittenPath = rewriteLegacyRequest(req);
  const rewrittenPathOnly = rewrittenPath.split('?')[0];
  const serviceUrl = getTargetServiceUrl(rewrittenPath);

  if (!serviceUrl) {
    return res.status(404).json({
      error: 'Gateway route not found',
      message: `No upstream service mapping for ${originalPath}`,
      path: originalPath,
      rewrittenPath,
    });
  }

  const fullUrl = `${serviceUrl}${rewrittenPath}`;
  const mappedBody = mapLegacyRequestBody(rewrittenPathOnly, req.method, req.body);

  const forwardedHeaders = { ...req.headers } as Record<string, any>;
  delete forwardedHeaders.host;
  delete forwardedHeaders['content-length'];
  delete forwardedHeaders.connection;

  console.log(`[Gateway] ${req.method} ${originalPath} -> ${fullUrl}`);

  try {
    const response = await axios({
      method: req.method.toLowerCase() as any,
      url: fullUrl,
      data: req.method.toUpperCase() === 'GET' ? undefined : mappedBody,
      headers: forwardedHeaders,
      validateStatus: () => true,
    });

    const mappedResponse = await mapLegacyResponse(
      originalPath,
      req.method,
      response.data,
    );

    return res.status(response.status).send(mappedResponse);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Gateway error',
      message: error.message,
      path: originalPath,
      rewrittenPath,
      upstream: fullUrl,
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