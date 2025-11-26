"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
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
    X
} from "lucide-react";
import { useState } from "react";

interface AdminHeaderProps {
    projectName?: string;
    projectLogo?: string;
}

export default function AdminHeader({ projectName = "Sifaka CMS", projectLogo }: AdminHeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

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
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                                    S
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
                        <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="hidden md:inline">Paramètres</span>
                        </button>
                        <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Déconnexion</span>
                        </button>

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
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}
