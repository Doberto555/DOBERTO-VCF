import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  matcher: ['/:path*']
};

const RETIRED_OWNER_PATH = '/owner-access.html';

function retired() {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive'
    }
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // The old maintenance/owner gate used the admin password as a second login surface.
  // Maintenance is no longer enabled, so keeping that surface would only provide a
  // password-guessing oracle outside the protected admin login flow.
  if (url.pathname === RETIRED_OWNER_PATH || url.pathname === '/owner-access') {
    return retired();
  }

  return next();
}
