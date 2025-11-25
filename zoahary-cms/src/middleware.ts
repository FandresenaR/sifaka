import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Routes admin protégées
  const isAdminRoute = path.startsWith("/admin");
  
  // Si accès à une route admin
  if (isAdminRoute) {
    // Vérifier si l'utilisateur a un cookie de session NextAuth
    const sessionToken = request.cookies.get("authjs.session-token") || 
                        request.cookies.get("__Secure-authjs.session-token");
    
    // Pas de session → redirection vers login
    if (!sessionToken) {
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Note: La vérification 2FA sera faite côté serveur dans les pages
    // car on ne peut pas accéder à Prisma depuis le middleware Edge
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
