import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import type { UserRole } from "../node_modules/.prisma/client-web"
import { useEffect, useState } from "react"

export function useAuth() {
    const { data: session, status, update } = useSession()
    const [hasChecked, setHasChecked] = useState(false)

    // Attendre que la session soit vraiment vérifiée
    useEffect(() => {
        if (status !== "loading") {
            // Petit délai pour s'assurer que le cookie est lu
            const timer = setTimeout(() => {
                setHasChecked(true)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [status])

    const isLoading = status === "loading" || !hasChecked
    const isLoggedIn = status === "authenticated" && !!session?.user

    const user = session?.user ? {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.name || "",
        image: session.user.image || "",
        role: session.user.role as UserRole,
    } : null

    const logout = async () => {
        await nextAuthSignOut({ callbackUrl: "/" })
    }

    // Force refresh session
    const refreshSession = async () => {
        await update()
    }

    return {
        user,
        isLoading,
        isLoggedIn,
        logout,
        session,
        refreshSession,
    }
}
