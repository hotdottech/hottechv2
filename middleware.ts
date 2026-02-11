import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // 2. Initialize Supabase Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Update request cookies
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            // Re-create response to include updated cookies
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            // Update response cookies
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 3. Refresh Session
    await supabase.auth.getUser();
  } catch {
    // On error, continue without session refresh so the request still succeeds
  }

  return response;
}

export const config = {
  matcher: [
    // Only run on Admin, Login, Signup, and API routes.
    // Ignore the root "/" and public posts.
    '/admin/:path*',
    '/login',
    '/signup',
    '/auth/:path*',
    '/account/:path*',
  ],
};
