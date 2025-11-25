"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Check2FA() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Si 2FA est activé et pas encore vérifié, rediriger
      if (session.user.twoFactorEnabled && !session.user.twoFactorVerified) {
        router.push("/auth/verify-2fa");
      }
    } else if (status === "unauthenticated") {
      // Pas de session, rediriger vers login
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  // Pendant le chargement ou avant la redirection
  if (status === "loading" || 
      (status === "authenticated" && session?.user.twoFactorEnabled && !session.user.twoFactorVerified)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-300">Vérification...</div>
      </div>
    );
  }

  return null;
}
