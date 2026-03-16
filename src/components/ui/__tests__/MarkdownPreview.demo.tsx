import React, { useState } from 'react';
import MarkdownPreview from '../MarkdownPreview';

/**
 * Demo component to test MarkdownPreview functionality
 * This is not a test file but a demo for manual testing
 */
export default function MarkdownPreviewDemo() {
  const [content, setContent] = useState(`# Sample Markdown

This is a **bold** text and *italic* text.

## Features

- [x] Completed task
- [ ] Incomplete task

### Code Example

\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

### Table

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote with some important information.

### Strikethrough

~~This text is crossed out~~
`);

  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">MarkdownPreview Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Input</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="Enter your markdown here..."
          />
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
                className="mr-2"
              />
              Show original markdown
            </label>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-auto">
            <MarkdownPreview 
              content={content}
              showOriginal={showOriginal}
              className="h-full"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setContent('')}
            className="btn-secondary"
          >
            Test Empty Content
          </button>
          <button
            onClick={() => setContent('   \n\n   ')}
            className="btn-secondary"
          >
            Test Whitespace Only
          </button>
          <button
            onClick={() => setContent('Invalid markdown [[[')}
            className="btn-secondary"
          >
            Test Invalid Markdown
          </button>
        </div>
      </div>
    </div>
  );
}