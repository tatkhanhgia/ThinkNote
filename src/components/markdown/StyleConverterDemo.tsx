'use client';

import React, { useState } from 'react';
import { StyleConverter } from './StyleConverter';

const StyleConverterDemo: React.FC = () => {
  const [inputHtml, setInputHtml] = useState(`
<h1>Sample Article Title</h1>
<p style="text-align: center;">This is a centered paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
<h2>Code Example</h2>
<pre><code class="language-javascript">
const greeting = "Hello, World!";
console.log(greeting);
</code></pre>
<blockquote>
  <p>This is an important quote that should stand out.</p>
</blockquote>
<ul>
  <li>First list item</li>
  <li>Second list item with <a href="https://example.com">a link</a></li>
</ul>
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
  `.trim());

  const [preserveClasses, setPreserveClasses] = useState(false);
  const [applyProse, setApplyProse] = useState(true);

  const convertedHtml = StyleConverter.convertToProjectFormat(inputHtml, {
    preserveOriginalClasses: preserveClasses,
    applyProseClasses: applyProse
  });

  const validation = StyleConverter.validateConversion(inputHtml, convertedHtml);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">StyleConverter Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Input HTML</h2>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preserveClasses}
                  onChange={(e) => setPreserveClasses(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Preserve original classes</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={applyProse}
                  onChange={(e) => setApplyProse(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Apply prose wrapper</span>
              </label>
            </div>
            
            <textarea
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Enter HTML content..."
            />
            
            {/* Validation Status */}
            <div className={`p-3 rounded-lg ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.isValid ? 'Validation Passed' : 'Validation Issues'}
                </span>
              </div>
              {validation.issues.length > 0 && (
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Converted Output</h2>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-600">Preview</span>
              </div>
              <div 
                className="p-4 bg-white min-h-64 overflow-auto"
                dangerouslySetInnerHTML={{ __html: convertedHtml }}
              />
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-600">HTML Source</span>
              </div>
              <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-auto max-h-64">
                <code>{convertedHtml}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleConverterDemo;