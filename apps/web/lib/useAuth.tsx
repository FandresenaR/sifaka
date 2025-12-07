/**
 * Hook React pour gérer l'authentification OAuth
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/oauth";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string; // Normalisé pour compatibilité avec le header
  picture?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifie l'authentification au montage
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setIsLoggedIn(isAuth);

      if (isAuth) {
        const currentUser = getCurrentUser();
        // Normalise le champ image/picture
        if (currentUser) {
          setUser({
            ...currentUser,
            image: currentUser.picture || currentUser.image,
          });
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsLoggedIn(false);
    router.push("/auth/signin");
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    logout: handleLogout,
  };
}

/**
 * Composant HOC pour protéger les routes nécessitant une authentification
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P & { user: User }>
) {
  return function AuthComponent(props: P) {
    const { user, isLoading, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isLoggedIn) {
        router.push("/auth/signin");
      }
    }, [isLoading, isLoggedIn, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      );
    }

    if (!isLoggedIn || !user) {
      return null;
    }

    return <Component {...props} user={user} />;
  };
}
