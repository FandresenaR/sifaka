"use client";

import { Header } from "@/components/layout/Header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="pt-24 pb-12 container mx-auto px-6">
                {children}
            </main>
        </div>
    );
}
