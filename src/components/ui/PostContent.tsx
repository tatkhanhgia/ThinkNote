"use client";

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

type PostContentProps = {
  contentHtml: string;
};

export default function PostContent({ contentHtml }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for dark mode preference
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    mermaid.initialize({
      startOnLoad: false,
      // Use 'dark' theme if in dark mode, otherwise 'neutral'
      theme: isDarkMode ? 'dark' : 'neutral',
    });

    async function renderMermaid() {
      if (contentRef.current) {
        try {
          const nodes = contentRef.current.querySelectorAll('code.language-mermaid');
          if (nodes.length > 0) {
            await mermaid.run({ nodes });
          }
        } catch (e) {
          console.error("Error rendering mermaid diagrams:", e);
        }
      }
    }

    renderMermaid();
    
  // Rerun this effect whenever the content changes
  }, [contentHtml]);

  return (
    <div 
      ref={contentRef}
      className="prose dark:prose-invert max-w-none" 
      dangerouslySetInnerHTML={{ __html: contentHtml }} 
    />
  );
}
