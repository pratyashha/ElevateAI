import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/resume(.*)', 
  '/interview(.*)',  
  '/ai-cover-letter(.*)',
  '/cover-letter(.*)',
  '/onboarding(.*)',
  '/redirect(.*)'
]);

export default clerkMiddleware(async (authRequest, req) => {
  const { userId } = await authRequest();

  // Check authentication - if no user and trying to access protected route, redirect to sign in
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await authRequest();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Note: Onboarding checks are handled at the page level for better reliability
  // This ensures Prisma queries work properly in Node.js runtime instead of edge runtime
  return NextResponse.next();
});
  
export const config = {
  matcher: [

    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};