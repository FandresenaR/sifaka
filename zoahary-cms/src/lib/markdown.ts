import { marked } from "marked";

export function renderMarkdownOrHtml(content: string): string {
  const trimmed = content.trim();
  // If content looks like HTML document or starts with block-level HTML tags, return as-is
  if (/^<\s*(html|body|h[1-6]|p|ul|ol|blockquote|img|hr|div|section|article|table)[\s>]/i.test(trimmed)) {
    return content;
  }
  // Otherwise, treat as Markdown
  if (typeof (marked as any).parseSync === 'function') {
    return (marked as any).parseSync(content);
  }
  return marked.parse(content) as string;
}
