import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Le proxy fait une vérification rapide du cookie pour éviter les appels inutiles
// La vraie validation du token JWT se fait dans app/admin/layout.tsx avec auth()
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Vérification rapide: un cookie de session existe-t-il ?
    const sessionCookies = [
        "__Secure-authjs.session-token",
        "authjs.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.session-token",
    ]

    const hasSessionCookie = sessionCookies.some(name => request.cookies.get(name))
    
    // Vérifier aussi les cookies chunked
    if (!hasSessionCookie) {
        const allCookies = request.cookies.getAll?.() || []
        const hasChunkedCookie = allCookies.some(c => 
            /(^__Secure-)?(authjs|next-auth)\.session-token/.test(c.name)
        )
        if (!hasChunkedCookie && pathname.startsWith("/admin")) {
            return NextResponse.redirect(new URL("/auth/signin", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
