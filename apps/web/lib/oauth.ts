/**
 * OAuth Google Configuration
 * Gestion de l'authentification Google OAuth directe (sans NextAuth)
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const REDIRECT_URI = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/auth/callback`;

/**
 * Génère l'URL de connexion Google OAuth
 */
export function getGoogleAuthURL() {
  const scope = ["openid", "email", "profile"].join(" ");
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Échange le code d'autorisation contre un token API
 */
export async function exchangeCodeForToken(code: string): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/oauth/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`OAuth exchange failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Récupère le token depuis le stockage local
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Stocke le token
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

/**
 * Supprime le token
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

/**
 * Récupère l'utilisateur depuis le stockage local
 */
export function getCurrentUser(): {
  id: string;
  email: string;
  name: string;
  picture?: string;
  image?: string;
} | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Stocke les infos utilisateur
 */
export function setCurrentUser(user: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_user", JSON.stringify(user));
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Se déconnecter
 */
export async function logout(): Promise<void> {
  clearToken();
  const user = getCurrentUser();
  if (user?.id) {
    // Optionnel: Notifier l'API
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }).catch(() => {
      // Ignorer les erreurs de logout côté API
    });
  }
  localStorage.removeItem("auth_user");
}
