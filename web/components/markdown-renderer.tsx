"use client";

import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    let html = content;

    // Check if content is already HTML (contains HTML tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(html);

    if (isHtml) {
      // Content is already HTML from rich text editor
      return html;
    }

    // Otherwise, process as Markdown
    // Headers
    html = html.replace(
      /^### (.*?)$/gm,
      '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*?)$/gm,
      '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>'
    );
    html = html.replace(
      /^# (.*?)$/gm,
      '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>'
    );

    // Bold and italic
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Lists
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>');
    html = html.replace(
      /(<li.*?<\/li>)/s,
      '<ul class="list-disc space-y-1 my-2">$1</ul>'
    );

    // Paragraphs
    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html}</p>`;
    html = html.replace(/<p><\/p>/g, "");

    return html;
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none text-foreground space-y-4 ql-editor"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
