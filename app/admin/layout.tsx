import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import AdminHeader from "@/components/admin/AdminHeader"
import { DevModeBanner } from "@/components/DevModeBanner"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Vérification serveur stricte - valide le token JWT avant d'afficher quoi que ce soit
    const session = await auth()
    
    if (!session?.user) {
        redirect("/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <DevModeBanner />
            <AdminHeader />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
