import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Special handling for sitemap.xml
  if (path === '/sitemap.xml') {
    return NextResponse.next({
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }

  // Define paths that are considered public
  const publicPaths = ['/', '/api/auth', '/privacy-policy', '/terms-of-service', '/sitemap.xml', '/robots.txt'];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // If it's a public path, don't check for authentication
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for the session token
  const token = await getToken({ 
    req,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If there's no token and the path requires authentication, redirect to the home page
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If there is a token, allow the request to proceed
  return NextResponse.next();
}