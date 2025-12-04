import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Protéger les routes /admin
    if (pathname.startsWith("/admin")) {
        if (!session) {
            // Rediriger vers la page de connexion
            return NextResponse.redirect(new URL("/auth/signin", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
