import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const pages = [
  { id: 2, name: '계정 정보 조회' },
  { id: 3, name: '매치 정보 조회' },
  { id: 4, name: '랭커 정보 조회' },
  { id: 5, name: '메타데이터 정보 조회' },
  { id: 6, name: '이미지 정보 조회' },
];

const BASE_URL = 'https://openapi.nexon.com/ko/game/fconline/';

async function scrapePageDetail(page, id, name) {
  console.log(`\n=== ${name} (id=${id}) ===`);
  const url = `${BASE_URL}?id=${id}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click on each API endpoint to expand details
  const expandableItems = await page.$$('button, [role="button"], summary, [class*="endpoint"], [class*="operation"], [class*="expand"]');
  console.log(`  Found ${expandableItems.length} clickable items`);

  for (const item of expandableItems) {
    try {
      const text = await item.innerText();
      if (text.includes('GET') || text.includes('POST') || text.includes('/fconline') || text.includes('/static') || text.includes('/live')) {
        console.log(`  Clicking: ${text.substring(0, 60)}`);
        await item.click();
        await page.waitForTimeout(1500);
      }
    } catch {}
  }

  await page.waitForTimeout(1000);

  // Get full page content after expanding
  const content = await page.evaluate(() => document.body.innerText);

  return { id, name, content };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  for (const p of pages) {
    const result = await scrapePageDetail(page, p.id, p.name);
    results.push(result);
  }

  await browser.close();

  let output = '';
  for (const r of results) {
    output += `\n${'='.repeat(80)}\n# ${r.name} (id=${r.id})\n${'='.repeat(80)}\n\n`;
    output += r.content + '\n';
  }

  writeFileSync('docs/scraped-api-detail.txt', output, 'utf-8');
  console.log('\nDone! Saved to docs/scraped-api-detail.txt');
}

main().catch(console.error);
