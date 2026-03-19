import { getBrowser, getPage, disconnectBrowser } from '../scripts/lib/browser.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function uploadTest() {
  const browser = await getBrowser();
  const page = await getPage(browser);

  // Navigate to import page
  await page.goto('http://localhost:3001/en/markdown-import', { waitUntil: 'networkidle2' });

  // Create a test markdown file
  const testContent = `---
title: Test Article
description: A test article for import
date: 2026-03-17
tags: [test, import]
categories: [Testing]
---

# Test Article

This is a test article.

## Section One

Some content here.

\`\`\`javascript
const x = 1;
\`\`\`
`;
  const tmpFile = '/tmp/test-import.md';
  fs.writeFileSync(tmpFile, testContent);

  // Upload the file via the hidden input
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(tmpFile);
    console.log(JSON.stringify({ success: true, step: 'file uploaded' }));
  } else {
    console.log(JSON.stringify({ success: false, error: 'No file input found' }));
    await disconnectBrowser();
    return;
  }

  // Wait for preview step to appear
  await page.waitForTimeout(2000);

  // Take screenshot of preview step
  await page.screenshot({ path: '.claude/chrome-devtools/screenshots/import-preview.png', fullPage: true });
  console.log(JSON.stringify({ success: true, step: 'screenshot taken' }));

  await disconnectBrowser();
}

uploadTest().catch(e => {
  console.log(JSON.stringify({ success: false, error: e.message }));
  process.exit(1);
});
