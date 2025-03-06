import { NextResponse } from "next/server";

export function middleware(request) {
  // Route yang perlu dilindungi
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    // Cek apakah user sudah login (via cookie)
    const authCookie = request.cookies.get("auth-session");
    if (!authCookie) {
      // Redirect ke login jika belum login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

// Setelah login berhasil
document.cookie = "auth-session=true; path=/; max-age=86400"; // 24 jam
