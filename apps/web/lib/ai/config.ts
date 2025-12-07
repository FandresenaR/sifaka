import prisma from "@/lib/prisma";

export type AIProvider = "openai" | "claude" | "openrouter";

export interface AIModelConfig {
    provider: AIProvider;
    apiKey: string;
    model: string;
}

export async function getAIConfig(provider: AIProvider): Promise<AIModelConfig | null> {
    const config = await prisma.aIConfig.findUnique({
        where: { provider },
    });

    if (!config || !config.enabled) return null;

    return {
        provider,
        apiKey: config.apiKey,
        model: config.model || getDefaultModel(provider),
    };
}

function getDefaultModel(provider: AIProvider): string {
    switch (provider) {
        case "openai":
            return "gpt-4-turbo-preview";
        case "claude":
            return "claude-3-opus-20240229";
        case "openrouter":
            return "mistralai/mixtral-8x7b-instruct";
        default:
            return "";
    }
}
