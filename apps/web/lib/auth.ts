import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import type { UserRole } from "../node_modules/.prisma/client-web"
import type { Adapter } from "next-auth/adapters"

// Email du super admin
const SUPER_ADMIN_EMAIL = "fandresenar6@gmail.com"

// Note: La configuration IPv4 pour undici est dans instrumentation.ts

export const { handlers, signIn, signOut, auth } = NextAuth({
    // Temporairement désactivé pour éviter les problèmes de réseau
    // adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
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
        async signIn({ user }) {
            return true
        },
        async jwt({ token, account, profile }) {
            // Premier login - définir toutes les données
            if (account && profile) {
                token.id = profile.sub
                token.email = profile.email
                token.name = profile.name
                token.picture = (profile as any).picture
                token.role = profile.email === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : "USER"
                token.id_token = account.id_token // Capture l'ID Token de Google
            }

            // S'assurer que le role est toujours défini
            if (!token.role && token.email) {
                token.role = token.email === SUPER_ADMIN_EMAIL ? "SUPER_ADMIN" : "USER"
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
                session.user.id_token = token.id_token as string // Expose l'ID Token
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
    debug: false,
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
            id_token?: string // Ajout du champ id_token
        }
    }

    interface User {
        role?: UserRole
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id?: string
        role?: UserRole
        picture?: string
        id_token?: string // Ajout du champ id_token
    }
}
