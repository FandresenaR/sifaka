import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "EDITOR" | "SUPER_ADMIN";
      twoFactorEnabled: boolean;
      twoFactorVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN" | "EDITOR" | "SUPER_ADMIN";
    twoFactorEnabled: boolean;
    twoFactorVerified?: boolean;
    twoFactorSecret?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role: "USER" | "ADMIN" | "EDITOR" | "SUPER_ADMIN";
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
  }
}
