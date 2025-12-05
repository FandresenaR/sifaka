import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check for known session cookie names for next-auth / authjs
    const cookieCandidates = [
        "__Secure-authjs.session-token",
        "authjs.session-token",
        "__Secure-next-auth.session-token",
        "next-auth.session-token",
    ]

    let hasSession = cookieCandidates.some((name) => request.cookies.get(name))

    // Also check for chunked cookies like 'authjs.session-token.0'
    if (!hasSession && typeof request.cookies.getAll === "function") {
        const allCookies = request.cookies.getAll()
        hasSession = allCookies.some((c) => /(^__Secure-)?(authjs|next-auth)\.session-token(\.|$)/.test(c.name))
    }

    if (pathname.startsWith("/admin") && !hasSession) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*"],
}
