import AdminHeader from "@/components/admin/AdminHeader"
import { AdminProtection } from "@/components/admin/AdminProtection"
import { DevModeBanner } from "@/components/DevModeBanner"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminProtection>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <DevModeBanner />
                <AdminHeader />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </AdminProtection>
    )
}
