import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

// Email du super admin
const SUPER_ADMIN_EMAIL = "fandresenar6@gmail.com"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Permettre la connexion
            return true
        },
        async session({ session, user }) {
            if (session.user) {
                // Ajouter l'ID et le rôle à la session
                session.user.id = user.id
                session.user.role = user.role as UserRole

                // Vérifier si c'est le super admin
                if (user.email === SUPER_ADMIN_EMAIL) {
                    // Mettre à jour le rôle en SUPER_ADMIN si ce n'est pas déjà fait
                    if (user.role !== "SUPER_ADMIN") {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { role: "SUPER_ADMIN" },
                        })
                        session.user.role = "SUPER_ADMIN"
                    }
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "database",
    },
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
        role: UserRole
    }
}
