import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { generateWithOpenAI } from "@/lib/ai/openai";
import { generateWithClaude } from "@/lib/ai/claude";
import { generateWithOpenRouter } from "@/lib/ai/openrouter";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { provider, prompt, systemPrompt } = await req.json();

        let result;
        switch (provider) {
            case "openai":
                result = await generateWithOpenAI(prompt, systemPrompt);
                break;
            case "claude":
                result = await generateWithClaude(prompt, systemPrompt);
                break;
            case "openrouter":
                result = await generateWithOpenRouter(prompt, systemPrompt);
                break;
            default:
                return new NextResponse("Invalid provider", { status: 400 });
        }

        return NextResponse.json({ result });
    } catch (error) {
        console.error("AI Generation Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== "SUPER_ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { provider, apiKey, model, enabled } = await req.json();

        const config = await prisma.aIConfig.upsert({
            where: { provider },
            update: { apiKey, model, enabled },
            create: { provider, apiKey, model, enabled },
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("AI Config Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
