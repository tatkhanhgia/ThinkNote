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
      theme: 'base',
      themeVariables: {
        // Nền trắng, border đen
        primaryColor: '#ffffff',
        primaryTextColor: '#000000',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        secondaryColor: '#ffffff',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#ffffff',
        tertiaryBkg: '#ffffff',

        // Text colors
        textColor: '#000000',
        secondaryTextColor: '#000000',
        tertiaryTextColor: '#000000',

        // Flowchart specific
        nodeTextColor: '#000000',

        // Sequence diagram specific  
        signalTextColor: '#000000',
        loopTextColor: '#000000',
      },
      securityLevel: 'loose',
      fontFamily: 'inherit',

      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 80
      },
      sequence: {
        useMaxWidth: true,
      },
      gantt: {
        useMaxWidth: true,
      },
      journey: {
        useMaxWidth: true,
      },
      timeline: {
        useMaxWidth: true,
      }
    });

    async function renderMermaid() {
      if (contentRef.current) {
        try {
          // Select all code blocks with language-mermaid
          const codeNodes = contentRef.current.querySelectorAll('code.language-mermaid');

          const nodesToRender: HTMLElement[] = [];

          codeNodes.forEach((codeNode) => {
            const preNode = codeNode.parentElement;

            // Only proceed if the parent is a <pre> tag (which remark-html usually generates)
            if (preNode && preNode.tagName === 'PRE') {
              // Create a new container for the diagram
              const divContainer = document.createElement('div');
              divContainer.className = 'mermaid my-8 w-full';

              // Move the content from code to div
              divContainer.textContent = codeNode.textContent;

              // Replace the <pre> with the new <div>
              if (preNode.parentNode) {
                preNode.parentNode.replaceChild(divContainer, preNode);
                nodesToRender.push(divContainer);
              }
            } else if (codeNode.parentElement) {
              // Fallback if not wrapped in pre (unlikely with standard remark-html but good for safety)
              codeNode.classList.add('mermaid');
              nodesToRender.push(codeNode as HTMLElement);
            }
          });

          if (nodesToRender.length > 0) {
            await mermaid.run({ nodes: nodesToRender });

            // Adjust SVG size for better display after rendering
            nodesToRender.forEach((node) => {
              const svg = node.querySelector('svg');
              if (svg) {
                const bbox = svg.getBBox();

                // 2. Tạo viewBox từ kích thước thật này
                // Lưu ý: bbox.x và bbox.y quan trọng để căn lề, không được fix cứng là 0
                const viewBoxValue = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;

                // 3. Set viewBox chuẩn
                svg.setAttribute('viewBox', viewBoxValue);

                // 4. Xóa width/height cứng để nó responsive theo CSS
                svg.removeAttribute('width');
                svg.removeAttribute('height');

                // Remove fixed width/height and let CSS handle it
                svg.style.width = '100%';
                svg.style.height = 'auto';
                svg.style.maxWidth = '100%';

                // Ensure proper aspect ratio
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
              }
            });
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
