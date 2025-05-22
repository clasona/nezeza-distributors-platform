import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { CustomTokenProps } from '../type';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected and admin-only routes
  const protectedPages = [
    '/customer',
    '/manufacturer',
    '/wholesaler',
    '/retailer',
    '/admin',
  ];
 const storeTypeRoutes: Record<string, string[]> = {
   manufacturing: ['/manufacturer'],
   wholesale: ['/wholesaler'],
   retail: ['/retailer'],
   admin: ['/admin'],
   customer: ['/customer'],
 };

  // Check if request is for a protected page
  if (protectedPages.some((page) => pathname.startsWith(page))) {
    // Retrieve authentication token
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as CustomTokenProps | null;

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url); // Store intended page
      return NextResponse.redirect(loginUrl);
    }

    const userStoreType = token.user.storeId?.storeType;

    // Redirect unauthorized users if they attempt to access a route they are not permitted to
    if (
      userStoreType &&
      !storeTypeRoutes[userStoreType]?.some((page) => pathname.startsWith(page))
    ) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/manufacturer/:path*',
    '/wholesaler/:path*',
    '/retailer/:path*',
    '/admin/:path*',
  ],
};
