import { getBrowser, getPage, disconnectBrowser } from '../../skills/chrome-devtools/scripts/lib/browser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const screenshotDir = path.join(projectRoot, '.claude', 'chrome-devtools', 'screenshots');
const tmpMd = path.join(projectRoot, '.claude', 'chrome-devtools', 'tmp', 'test-import.md');

async function uploadTest() {
  const browser = await getBrowser();
  const page = await getPage(browser);

  await page.goto('http://localhost:3001/en/markdown-import', { waitUntil: 'networkidle2' });

  const testContent = '# Test Article\n\nThis is a test article.\n\n## Section One\n\nSome content here.\n\n```javascript\nconst x = 1;\n```\n';
  fs.writeFileSync(tmpMd, testContent);

  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(tmpMd);
    process.stderr.write('file uploaded\n');
  } else {
    process.stderr.write('No file input found\n');
    await disconnectBrowser();
    return;
  }

  // Wait for preview step
  await new Promise(r => setTimeout(r, 2000));

  const screenshotPath = path.join(screenshotDir, 'import-preview.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  process.stderr.write('screenshot taken: ' + screenshotPath + '\n');

  await disconnectBrowser();
}

uploadTest().catch(e => {
  process.stderr.write(e.message + '\n');
  process.exit(1);
});
