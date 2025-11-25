import { Conversation, ConversationSummary } from "@/types/chat";

const STORAGE_KEY = "chat_conversations";
const MAX_CONVERSATIONS = 100;

/**
 * Generate a unique conversation ID
 */
export function generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all conversations from localStorage
 */
function getAllConversationsRaw(): Conversation[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading conversations from localStorage:", error);
        return [];
    }
}

/**
 * Save all conversations to localStorage
 */
function saveAllConversations(conversations: Conversation[]): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Error saving conversations to localStorage:", error);
        // If quota exceeded, remove oldest conversations
        if (error instanceof DOMException && error.name === "QuotaExceededError") {
            const reducedConversations = conversations.slice(-50); // Keep only 50 most recent
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedConversations));
        }
    }
}

/**
 * Save a conversation (create or update)
 */
export function saveConversation(conversation: Conversation): void {
    const conversations = getAllConversationsRaw();
    const existingIndex = conversations.findIndex((c) => c.id === conversation.id);

    if (existingIndex >= 0) {
        // Update existing conversation
        conversations[existingIndex] = {
            ...conversation,
            updatedAt: Date.now(),
        };
    } else {
        // Add new conversation
        conversations.push({
            ...conversation,
            updatedAt: Date.now(),
        });

        // Enforce max limit (FIFO)
        if (conversations.length > MAX_CONVERSATIONS) {
            conversations.shift(); // Remove oldest
        }
    }

    saveAllConversations(conversations);
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(id: string): Conversation | null {
    const conversations = getAllConversationsRaw();
    return conversations.find((c) => c.id === id) || null;
}

/**
 * Get all conversations as summaries (sorted by updatedAt, most recent first)
 */
export function getAllConversations(): ConversationSummary[] {
    const conversations = getAllConversationsRaw();

    return conversations
        .map((conv) => ({
            id: conv.id,
            title: conv.title,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messageCount: conv.messages.length,
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
}

/**
 * Delete a conversation by ID
 */
export function deleteConversation(id: string): void {
    const conversations = getAllConversationsRaw();
    const filtered = conversations.filter((c) => c.id !== id);
    saveAllConversations(filtered);
}

/**
 * Update a conversation partially
 */
export function updateConversation(
    id: string,
    updates: Partial<Conversation>
): void {
    const conversations = getAllConversationsRaw();
    const index = conversations.findIndex((c) => c.id === id);

    if (index >= 0) {
        conversations[index] = {
            ...conversations[index],
            ...updates,
            updatedAt: Date.now(),
        };
        saveAllConversations(conversations);
    }
}

/**
 * Clear all conversations (use with caution)
 */
export function clearAllConversations(): void {
    localStorage.removeItem(STORAGE_KEY);
}
