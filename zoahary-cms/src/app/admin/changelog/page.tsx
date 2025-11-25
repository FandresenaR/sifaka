import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Historique des mises à jour | Zoahary CMS",
    description: "Consultez les dernières mises à jour et fonctionnalités du CMS.",
};

export default async function ChangelogPage() {
    const session = await auth();
    if (!session) {
        redirect("/auth/signin");
    }

    // Lire le fichier CHANGELOG.md
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    let content = '';

    try {
        content = fs.readFileSync(changelogPath, 'utf-8');
    } catch (error) {
        content = "# Erreur\nImpossible de lire le fichier CHANGELOG.md";
    }

    // Convertir Markdown en HTML
    const htmlContent = marked(content);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Historique des mises à jour
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
}
