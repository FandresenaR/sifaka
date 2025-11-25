import sanitize from 'sanitize-html';

export function sanitizeHtmlServer(input: string) {
  if (!input) return '';
  // Convert \' to proper single quotes if present (often in AI content). Keep it safe.
  const html = String(input);

  const clean = sanitize(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'blockquote', 'hr', 'a', 'img', 'br', 'pre', 'code'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title']
    },
    // Force rel="noopener noreferrer" on anchor tags
    transformTags: {
      'a': (tagName, attribs) => {
        const href = attribs.href || '';
        if (/^javascript:/i.test(href)) {
          // remove href attribute
          delete attribs.href;
        } else {
          attribs.rel = 'noopener noreferrer';
          // Keep target if present
        }
        return {
          tagName: 'a',
          attribs
        };
      },
      'h3': (tagName, attribs) => ({ tagName: 'h2', attribs }), // map h3 -> h2
    },
    // Enforce protocol for urls
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto', 'tel'],
      img: ['http', 'https']
    }
  });
  // Remove unnecessary attributes (data-*, class, style)
  return clean.replace(/\sdata-[a-z0-9-]+=("|')[^"']*("|')/gi, '')
    .replace(/\sclass=("|')[^"']*("|')/gi, '')
    .replace(/\sstyle=("|')[^"']*("|')/gi, '')
    .trim();
}

export default sanitizeHtmlServer;
