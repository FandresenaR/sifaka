import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingChat from "@/components/FloatingChat";

export const metadata: Metadata = {
  title: "Zoahary Baobab CMS",
  description: "Système de gestion de contenu pour Zoahary Baobab Madagascar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <FloatingChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
