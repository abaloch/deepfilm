import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Define public routes
const publicRoutes = [
  '/',  // Landing page is public
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook',  // Add webhook route as public
  '/beautiful-woman-closeup.mp4'  // Add video file as public
];

// Helper function to check if a path is public
const isPublicPath = (path: string) => {
  return publicRoutes.some(route => {
    if (route.endsWith('(.*)')) {
      const baseRoute = route.slice(0, -4);
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
};

export default authMiddleware({
  async afterAuth(auth, req) {
    const { userId } = auth;
    const path = req.nextUrl.pathname;
    const hostname = req.nextUrl.hostname;

    // Handle sign-out redirect for both local and Clerk domains
    if (path === '/sign-out' || 
        path === '/sign-out-callback' || 
        (hostname.includes('accounts.dev') && path.includes('sign-out'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is not logged in and trying to access protected routes
    if (!userId && !isPublicPath(path)) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is logged in
    if (userId) {
      // Check if user has an active subscription
      const { data: user } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('clerk_id', userId)
        .single();

      // If user has an active subscription and is trying to access the landing page
      if (user?.subscription_status === 'active' && path === '/') {
        return NextResponse.redirect(new URL('/generate', req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include Clerk domains
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Additional patterns for other routes
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/'
  ],
};