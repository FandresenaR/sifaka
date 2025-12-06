import { getAIConfig } from "./config";

export async function generateWithClaude(prompt: string, systemPrompt?: string) {
    const config = await getAIConfig("claude");

    if (!config) {
        throw new Error("Claude configuration not found or disabled");
    }

    // Anthropic SDK implementation would go here
    // Using fetch for now to avoid adding another dependency if not needed immediately
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: config.model,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
            system: systemPrompt,
        }),
    });

    if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
}
