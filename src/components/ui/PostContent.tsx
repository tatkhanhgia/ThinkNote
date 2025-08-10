"use client";

import { useEffect } from 'react';
import mermaid from 'mermaid';

type PostContentProps = {
  contentHtml: string;
};

export default function PostContent({ contentHtml }: PostContentProps) {
  useEffect(() => {
    // This tells Mermaid it will be initialized manually
    mermaid.initialize({
      startOnLoad: false,
      // You can customize the theme to match your website
      theme: 'neutral', 
    });

    // After the component mounts, find all <code> elements with class 'language-mermaid' 
    // (which is what remark-html generates) and render them.
    async function renderMermaid() {
      try {
        await mermaid.run({
          nodes: document.querySelectorAll('code.language-mermaid'),
        });
      } catch (e) {
        console.error("Error rendering mermaid diagrams:", e);
      }
    }

    // Delay rendering slightly to ensure the DOM is fully ready
    const timer = setTimeout(() => {
        renderMermaid();
    }, 100);

    return () => clearTimeout(timer);
    
  // The empty dependency array ensures this effect runs only once
  // after the component initially mounts.
  }, [contentHtml]);

  return (
    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
  );
}
