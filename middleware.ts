import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const isPublicRoute = createRouteMatcher([
  '/',  // Landing page is public
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook',  // Add webhook route as public
  '/beautiful-woman-closeup.mp4'  // Add video file as public
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // If user is not logged in and trying to access protected routes
  if (!userId && !isPublicRoute(req)) {
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

  // For all other cases, proceed with normal authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include Clerk domains
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}