
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { encryptApiKey, maskApiKey } from "@/lib/encryption";

export async function GET() {
    try {
        const session = await auth();

        // Check if user is authenticated and is admin
        // Note: Adjust role check based on your specific role implementation
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get settings
        const settings = await prisma.settings.findFirst();

        return NextResponse.json({
            apiKeyConfigured: !!settings?.openRouterApiKey,
            maskedApiKey: settings?.openRouterApiKey ? maskApiKey(settings.openRouterApiKey) : null,
        });
    } catch (error) {
        console.error("Error fetching AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { apiKey } = await req.json();

        if (!apiKey || typeof apiKey !== 'string') {
            return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
        }

        // Basic validation for OpenRouter key format (optional)
        if (!apiKey.startsWith("sk-or-")) {
            return NextResponse.json({ error: "Invalid OpenRouter API key format" }, { status: 400 });
        }

        // Encrypt the API key
        // Note: In a real production app, ensure ENCRYPTION_KEY is set in .env
        const encryptedKey = encryptApiKey(apiKey);

        // Update or create settings
        // We assume there's only one settings record for the system
        const existingSettings = await prisma.settings.findFirst();

        if (existingSettings) {
            await prisma.settings.update({
                where: { id: existingSettings.id },
                data: { openRouterApiKey: encryptedKey },
            });
        } else {
            await prisma.settings.create({
                data: { openRouterApiKey: encryptedKey },
            });
        }

        return NextResponse.json({
            success: true,
            maskedApiKey: maskApiKey(apiKey)
        });
    } catch (error) {
        console.error("Error saving AI config:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
