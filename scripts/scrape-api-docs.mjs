import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://openapi.nexon.com/ko/game/fconline/';
const pages = [
  { id: 2, name: '계정 정보 조회' },
  { id: 3, name: '매치 정보 조회' },
  { id: 4, name: '랭커 정보 조회' },
  { id: 5, name: '메타데이터 정보 조회' },
  { id: 6, name: '이미지 정보 조회' },
];

async function scrapePage(page, url, name) {
  console.log(`\n=== Scraping: ${name} (${url}) ===`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for SPA content to render
  await page.waitForTimeout(3000);

  // Try to expand all collapsible sections
  const expandButtons = await page.$$('[class*="expand"], [class*="collapse"], [class*="toggle"], [class*="accordion"], details summary');
  for (const btn of expandButtons) {
    try { await btn.click(); } catch {}
  }
  await page.waitForTimeout(1000);

  // Extract the main content area text
  const content = await page.evaluate(() => {
    // Try to find the main content container
    const selectors = [
      'main',
      '[class*="content"]',
      '[class*="api"]',
      '[class*="doc"]',
      '.layout-content',
      '#__next',
      '#__nuxt',
      '#app',
    ];

    let el = null;
    for (const sel of selectors) {
      const found = document.querySelector(sel);
      if (found && found.innerText.length > 200) {
        el = found;
        break;
      }
    }

    if (!el) el = document.body;
    return el.innerText;
  });

  // Also extract any code blocks or pre elements
  const codeBlocks = await page.evaluate(() => {
    const blocks = [];
    document.querySelectorAll('pre, code, [class*="code"], [class*="json"], [class*="response"], [class*="request"]').forEach(el => {
      const text = el.innerText.trim();
      if (text.length > 10) blocks.push(text);
    });
    return blocks;
  });

  // Extract table data
  const tables = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('table').forEach(table => {
      const rows = [];
      table.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('td, th').forEach(td => cells.push(td.innerText.trim()));
        if (cells.length > 0) rows.push(cells.join(' | '));
      });
      if (rows.length > 0) result.push(rows.join('\n'));
    });
    return result;
  });

  return { name, url, content, codeBlocks, tables };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const p of pages) {
    const url = `${BASE_URL}?id=${p.id}`;
    const result = await scrapePage(page, url, p.name);
    results.push(result);
  }

  await browser.close();

  // Save raw results
  writeFileSync(
    'docs/scraped-api-raw.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  );

  // Save readable text version
  let text = '';
  for (const r of results) {
    text += `\n${'='.repeat(80)}\n`;
    text += `# ${r.name}\n`;
    text += `URL: ${r.url}\n`;
    text += `${'='.repeat(80)}\n\n`;
    text += `## Content:\n${r.content}\n\n`;

    if (r.tables.length > 0) {
      text += `## Tables:\n`;
      r.tables.forEach((t, i) => {
        text += `\n### Table ${i + 1}:\n${t}\n`;
      });
      text += '\n';
    }

    if (r.codeBlocks.length > 0) {
      text += `## Code Blocks:\n`;
      r.codeBlocks.forEach((c, i) => {
        text += `\n### Block ${i + 1}:\n${c}\n`;
      });
    }
  }

  writeFileSync('docs/scraped-api-docs.txt', text, 'utf-8');
  console.log('\nDone! Results saved to docs/scraped-api-raw.json and docs/scraped-api-docs.txt');
}

main().catch(console.error);
