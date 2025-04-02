import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/', '/beautiful-woman-closeup.mp4'])

export default clerkMiddleware(async (auth, req) => {
  console.log('Current route:', req.nextUrl.pathname)
  console.log('Is public route:', isPublicRoute(req))

  if (!isPublicRoute(req)) {
    await auth.protect()
  }
}, { debug: true })

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