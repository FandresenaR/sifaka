import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Middleware pour protéger les routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth()

  // Routes publiques (toujours accessibles)
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/error",
    "/api/auth",
  ]

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protéger les routes /admin
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Vérifier le rôle pour l'accès admin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Protéger les routes API (sauf auth et publiques)
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
