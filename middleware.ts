import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// List of public paths that don't require authentication
const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/api/create-checkout-session",
  "/api/update-subscription",
  "/subscribe/success",
  "/beautiful-woman-closeup.mp4"
];

function isPublicPath(path: string) {
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export default authMiddleware({
  publicRoutes: publicPaths,
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

      // If user has an active subscription and is trying to access the subscribe page
      if (user?.subscription_status === 'active' && path === '/subscribe') {
        return NextResponse.redirect(new URL('/generate', req.url));
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};