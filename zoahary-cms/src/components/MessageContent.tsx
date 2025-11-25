"use client";

import React, { useState } from "react";

interface MessageContentProps {
  content: string;
  role: "user" | "assistant" | "system";
}

export default function MessageContent({ content, role }: MessageContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [codeBlockPreviews, setCodeBlockPreviews] = useState<Record<number, boolean>>({});

  // Format text with bold, italic, and links
  const formatText = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Combined regex for links [text](url), bold (**text**), and italic (*text* or _text_)
    const regex = /(\[(.+?)\]\((.+?)\))|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      // Check which group matched
      if (match[1]) {
        // Link: [text](url)
        parts.push(
          <a
            key={`link-${key++}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            {match[2]}
          </a>
        );
      } else if (match[4]) {
        // Bold: **text**
        parts.push(<strong key={`bold-${key++}`} className="font-semibold">{match[5]}</strong>);
      } else if (match[6]) {
        // Italic: *text*
        parts.push(<em key={`italic-${key++}`} className="italic">{match[7]}</em>);
      } else if (match[8]) {
        // Italic: _text_
        parts.push(<em key={`italic-${key++}`} className="italic">{match[9]}</em>);
      }

      currentIndex = regex.lastIndex;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  // Detect code blocks, tables, and xaiArtifact tags
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'code' | 'table' | 'artifact'; content: string; language?: string; tableData?: { headers: string[]; rows: string[][] }; artifactData?: { title?: string; identifier?: string; type?: string } }> = [];

    // First, handle xaiArtifact tags which might contain other elements
    // Regex to match <xaiArtifact ...>content</xaiArtifact>
    // We use [\s\S]*? to match across newlines
    const artifactRegex = /<xaiArtifact([^>]*)>([\s\S]*?)<\/xaiArtifact>/g;

    let lastIndex = 0;
    let match;
    const artifactSegments: Array<{ type: 'artifact' | 'text'; content: string; attributes?: string }> = [];

    // 1. Split by artifacts
    while ((match = artifactRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        artifactSegments.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      artifactSegments.push({
        type: 'artifact',
        attributes: match[1],
        content: match[2]
      });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      artifactSegments.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    // 2. Process each segment
    artifactSegments.forEach(segment => {
      if (segment.type === 'artifact') {
        // Parse attributes
        const titleMatch = segment.attributes?.match(/title="([^"]*)"/);
        const idMatch = segment.attributes?.match(/identifier="([^"]*)"/);
        const typeMatch = segment.attributes?.match(/type="([^"]*)"/);

        // Add artifact header if title exists
        if (titleMatch && titleMatch[1]) {
          parts.push({
            type: 'text',
            content: `### ${titleMatch[1]}\n\n`
          });
        }

        // Recursively parse content inside artifact
        // For simplicity, we'll just treat it as text to be further parsed for code/tables
        // But we need to ensure we don't infinitely recurse if we were calling parseContent recursively
        // Here we'll just push it to be processed by the next steps (code/table parsing)
        // Actually, let's just process the content of the artifact as normal text
        // The artifact wrapper itself is mainly for metadata which we've extracted as a header

        // We'll process the inner content with the code/table parsers
        const innerParts = parseInnerContent(segment.content);
        parts.push(...innerParts);

      } else {
        // Normal text, process for code and tables
        const innerParts = parseInnerContent(segment.content);
        parts.push(...innerParts);
      }
    });

    return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
  };

  // Helper to parse code blocks and tables from text
  const parseInnerContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'code' | 'table'; content: string; language?: string; tableData?: { headers: string[]; rows: string[][] } }> = [];

    // First, extract code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const segments: Array<{ type: 'code' | 'text'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      segments.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'plaintext'
      });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    // Now process text segments for tables
    segments.forEach(segment => {
      if (segment.type === 'code') {
        parts.push({
          type: 'code',
          content: segment.content,
          language: segment.language
        });
      } else {
        // Look for Markdown tables in text
        const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
        let textLastIndex = 0;
        let tableMatch;

        while ((tableMatch = tableRegex.exec(segment.content)) !== null) {
          // Add text before table
          if (tableMatch.index > textLastIndex) {
            const textBefore = segment.content.slice(textLastIndex, tableMatch.index).trim();
            if (textBefore) {
              parts.push({
                type: 'text',
                content: textBefore
              });
            }
          }

          // Parse table
          const tableText = tableMatch[1];
          const lines = tableText.trim().split(/[\r\n]+/).filter(line => line.trim());

          if (lines.length >= 2) {
            const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
            const rows = lines.slice(2).map(row =>
              row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
            );

            parts.push({
              type: 'table',
              content: tableText,
              tableData: { headers, rows }
            });
          }

          textLastIndex = tableMatch.index + tableMatch[0].length;
        }

        // Add remaining text
        if (textLastIndex < segment.content.length) {
          const remainingText = segment.content.slice(textLastIndex).trim();
          if (remainingText) {
            parts.push({
              type: 'text',
              content: remainingText
            });
          }
        }
      }
    });

    return parts;
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderCodeBlock = (code: string, language: string, index: number) => {
    const isHtml = language === 'html' || language === 'xml';
    // Use component-level state for preview mode
    const showPreview = codeBlockPreviews[index] ?? isHtml;

    const togglePreview = () => {
      setCodeBlockPreviews(prev => ({
        ...prev,
        [index]: !showPreview
      }));
    };

    return (
      <div key={index} className="my-3 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-600 dark:text-gray-300">{language}</span>
            {isHtml && (
              <button
                onClick={togglePreview}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {showPreview ? 'Code' : 'Aperçu'}
              </button>
            )}
          </div>
          <button
            onClick={() => copyToClipboard(code, index)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
          >
            {copiedIndex === index ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copié!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Content */}
        {isHtml && showPreview ? (
          <div
            className="p-4 bg-white dark:bg-gray-800 overflow-auto max-h-96"
            dangerouslySetInnerHTML={{ __html: code }}
          />
        ) : (
          <pre className="p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto text-xs">
            <code className="font-mono text-gray-800 dark:text-gray-200">{code}</code>
          </pre>
        )}
      </div>
    );
  };

  const renderTable = (tableData: { headers: string[]; rows: string[][] }, content: string, index: number) => {
    return (
      <div key={index} className="my-3 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 text-xs">
          <span className="font-mono text-gray-600 dark:text-gray-300">Tableau</span>
          <button
            onClick={() => copyToClipboard(content, index)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors"
          >
            {copiedIndex === index ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copié!</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {tableData.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600"
                  >
                    {formatText(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2 text-gray-800 dark:text-gray-200"
                    >
                      {formatText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const parts = parseContent(content);

  return (
    <div className="message-content">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return renderCodeBlock(part.content, part.language || 'plaintext', index);
        }
        if (part.type === 'table' && part.tableData) {
          return renderTable(part.tableData, part.content, index);
        }
        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {formatText(part.content)}
          </div>
        );
      })}
    </div>
  );
}
