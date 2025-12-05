import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import type { UserRole } from "@prisma/client"
import type { Adapter } from "next-auth/adapters"

// Custom fetch pour contourner les problèmes undici
import "./custom-fetch"

// Email du super admin
const SUPER_ADMIN_EMAIL = "fandresenar6@gmail.com"

export const { handlers, signIn, signOut, auth } = NextAuth({
    // Temporairement désactivé pour éviter les problèmes de réseau
    // adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Permettre la connexion
            return true
        },
        async jwt({ token, user, account, profile }) {
            // Premier login
            if (account && profile) {
                token.id = profile.sub // Utiliser le sub de Google comme ID
                token.email = profile.email
                token.name = profile.name
                token.picture = (profile as any).picture
                
                // Vérifier si c'est le super admin
                if (profile.email === SUPER_ADMIN_EMAIL) {
                    token.role = "SUPER_ADMIN"
                } else {
                    token.role = "USER"
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.role = token.role as UserRole
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.image = token.picture as string
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // Après connexion, rediriger vers /admin
            if (url.startsWith(baseUrl)) return url
            if (url.startsWith("/")) return `${baseUrl}${url}`
            return baseUrl + "/admin"
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
    basePath: "/api/auth",
    debug: true, // Temporaire pour debug
    trustHost: true,
    useSecureCookies: process.env.NODE_ENV === 'production',
})

// Type augmentation for session
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }

    interface User {
        role?: UserRole
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: UserRole
        picture?: string
    }
}
