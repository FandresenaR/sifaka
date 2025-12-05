import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import type { UserRole } from "@prisma/client"

export function useAuth() {
    const { data: session, status } = useSession()
    
    const isLoading = status === "loading"
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

    return {
        user,
        isLoading,
        isLoggedIn,
        logout,
        session,
    }
}
