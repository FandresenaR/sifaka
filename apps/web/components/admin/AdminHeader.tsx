"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    FileText,
    Users,
    FolderOpen,
    Activity,
    Shield,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface AdminHeaderProps {
    projectName?: string;
    projectLogo?: string;
}

export default function AdminHeader({ projectName = "Sifaka CMS", projectLogo }: AdminHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const navigation = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Produits", href: "/admin/products", icon: Package },
        { name: "Blog", href: "/admin/blog", icon: FileText },
        { name: "Médias", href: "/admin/media", icon: FolderOpen },
        { name: "Utilisateurs", href: "/admin/users", icon: Users },
        { name: "Monitoring", href: "/admin/monitoring", icon: Activity },
        { name: "Sécurité", href: "/admin/security", icon: Shield },
    ];

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Project Name */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            {projectLogo ? (
                                <img src={projectLogo} alt={projectName} className="h-8 w-8 rounded-lg" />
                            ) : (
                                <div className="h-8 w-8 relative rounded-lg overflow-hidden">
                                    <Image
                                        src="/logo.png"
                                        alt="Sifaka Logo"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="font-semibold text-lg text-gray-900 dark:text-white hidden sm:block">
                                {projectName}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {session?.user ? (
                            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {session.user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {session.user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                                    </p>
                                </div>

                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full border border-gray-200 dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                )}

                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                    title="Déconnexion"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth/signin"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Connexion
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {session?.user && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 px-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {session.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {session.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Déconnexion</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
