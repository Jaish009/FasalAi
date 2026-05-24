// src/middleware.ts
// Clerk authentication middleware — protects dashboard routes
// Also triggers user sync on every authenticated request

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/alerts(.*)",
  "/profile(.*)",
  "/api/alerts(.*)",
  "/api/users(.*)",
  "/api/crops/my(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/prices(.*)",
  "/api/crops(.*)",
  "/api/mandis(.*)",
  "/api/predictions(.*)",
  "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Sync user to DB on first load (non-blocking)
  if (userId && !req.url.includes("/api/users/sync")) {
    const syncUrl = new URL("/api/users/sync", req.url);
    // Fire and forget — don't await to avoid blocking
    fetch(syncUrl.toString(), {
      method: "POST",
      headers: { Cookie: req.headers.get("cookie") || "" },
    }).catch(() => {});
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)","/(api|trpc)(.*)"],
};
