import { auth } from '@/auth';

const AUTH_PAGES = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Signed-in users have no reason to see login / register
  if (isAuthPage) {
    if (req.auth) return Response.redirect(new URL('/draw', req.url));
    return;
  }

  if (!req.auth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ['/draw/:path*', '/manage/:path*', '/login', '/register'],
};
