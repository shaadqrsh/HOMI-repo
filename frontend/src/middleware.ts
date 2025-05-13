import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const refresh = req.cookies.get("next-secure-id-homi");
  const access = req.cookies.get("next-session-id-homi");
  const userId = req.cookies.get("userIdHomi");

  if (!refresh || !access || !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/attendance/:path*",
    "/assignments/:path*",
    "/test/:path*",
    "/contributions/:path*",
  ],
};
