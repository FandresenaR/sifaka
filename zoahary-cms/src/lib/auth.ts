import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt", // IMPORTANT: Utiliser JWT au lieu de database sessions
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Toujours autoriser la connexion, la vérification 2FA se fera après
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Lors de la première connexion avec Google OAuth
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
        
        // IMPORTANT: Ne jamais réinitialiser twoFactorVerified s'il existe déjà
        // Cela permet de garder l'état vérifié même après reconnexion
        if (token.twoFactorVerified === undefined) {
          // Si 2FA n'est pas activé, marquer comme vérifié automatiquement
          // Si 2FA est activé, initialiser à false (première connexion uniquement)
          token.twoFactorVerified = !(user as any).twoFactorEnabled;
        }
      }

      // Permettre la mise à jour du token depuis le client
      if (trigger === "update") {
        if (session?.twoFactorVerified !== undefined) {
          token.twoFactorVerified = session.twoFactorVerified;
        }
        if (session?.twoFactorEnabled !== undefined) {
          token.twoFactorEnabled = session.twoFactorEnabled;
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // Utiliser user si disponible (avec adapter), sinon utiliser token
        if (user) {
          session.user.id = user.id;
          session.user.role = (user as any).role;
          session.user.twoFactorEnabled = (user as any).twoFactorEnabled;
          // IMPORTANT: Toujours utiliser token.twoFactorVerified, jamais user
          session.user.twoFactorVerified = token?.twoFactorVerified as boolean || false;
        } else if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as any;
          session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
          session.user.twoFactorVerified = token.twoFactorVerified as boolean;
        }
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
