/**
 * Translation utilities for blog posts
 * Manages French-English translation keys and relationships
 */

/**
 * Generate a unique translation key based on slug and timestamp
 * Format: article-{slug}-{timestamp}
 */
export function generateTranslationKey(slug: string): string {
  const timestamp = Date.now();
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  return `article-${cleanSlug}-${timestamp}`;
}

/**
 * Get the opposite language
 */
export function getOppositeLanguage(lang: string): 'FR' | 'EN' {
  return lang === 'FR' ? 'EN' : 'FR';
}

/**
 * Format language for display with flag
 */
export function formatLanguage(lang: string): string {
  return lang === 'FR' ? '🇫🇷 Français' : '🇬🇧 English';
}

/**
 * Get language flag emoji
 */
export function getLanguageFlag(lang: string): string {
  return lang === 'FR' ? '🇫🇷' : '🇬🇧';
}

/**
 * Validate translation key format
 */
export function isValidTranslationKey(key: string): boolean {
  return /^article-[a-z0-9-]+-\d+$/.test(key);
}

/**
 * Extract slug from translation key
 */
export function extractSlugFromKey(key: string): string | null {
  const match = key.match(/^article-(.+)-\d+$/);
  return match ? match[1] : null;
}
