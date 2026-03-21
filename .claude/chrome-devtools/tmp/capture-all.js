import { getBrowser, getPage, disconnectBrowser, outputJSON } from '../../skills/chrome-devtools/scripts/lib/browser.js';

const BASE = 'http://localhost:3006';
const PAGES = [
  { name: 'home', path: '/en' },
  { name: 'topics', path: '/en/topics' },
  { name: 'categories', path: '/en/categories' },
  { name: 'blog', path: '/en/blog' },
  { name: 'search', path: '/en/search' },
  { name: 'tags', path: '/en/tags' },
  { name: 'article', path: '/en/topics/vibecode-ai-tools-rebuilt' },
];
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
];
const OUT_DIR = '.claude/chrome-devtools/screenshots';

async function run() {
  const browser = await getBrowser();
  const page = await getPage(browser);
  const results = [];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    for (const pg of PAGES) {
      const url = `${BASE}${pg.path}`;
      const filename = `${OUT_DIR}/${pg.name}-${vp.name}.png`;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 1000)); // wait for animations
        await page.screenshot({ path: filename, fullPage: true });
        results.push({ page: pg.name, viewport: vp.name, file: filename, success: true });
      } catch (e) {
        results.push({ page: pg.name, viewport: vp.name, error: e.message, success: false });
      }
    }
  }

  outputJSON({ success: true, captured: results.length, results });
  await disconnectBrowser();
}

run();
