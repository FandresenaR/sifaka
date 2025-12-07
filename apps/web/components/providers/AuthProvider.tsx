"use client";

import { SessionProvider } from "next-auth/react";
import { TokenSync } from "@/components/auth/TokenSync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            refetchInterval={5 * 60} // Refetch session every 5 minutes
            refetchOnWindowFocus={true}
            basePath="/auth"
        >
            <TokenSync />
            {children}
        </SessionProvider>
    );
}
