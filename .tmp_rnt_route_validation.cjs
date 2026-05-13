const { chromium } = require('playwright');

(async () => {
  const base = 'http://127.0.0.1:5173';
  const browser = await chromium.launch({ headless: true });

  async function inspectRoute(path, checks) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const consoleErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => {
      consoleErrors.push(String(error));
    });

    await page.goto(`${base}${path}`, { waitUntil: 'networkidle', timeout: 30000 });

    const result = { path, consoleErrors };
    for (const [key, fn] of Object.entries(checks)) {
      result[key] = await fn(page);
    }

    await page.close();
    return result;
  }

  const result = [
    await inspectRoute('/veranstalter', {
      heading: async (page) => page.locator('h1').textContent(),
      loadErrorVisible: async (page) =>
        page.getByText('Veranstalter konnten nicht geladen werden').isVisible().catch(() => false),
      cardCount: async (page) => page.locator('article.card').count(),
      profileLinkCount: async (page) => page.locator('article.card a', { hasText: 'Profil' }).count(),
      websiteLinkCount: async (page) => page.locator('article.card a', { hasText: 'Website' }).count(),
      bodySnippet: async (page) => (await page.locator('body').innerText()).slice(0, 300)
    }),
    await inspectRoute('/djs', {
      heading: async (page) => page.locator('h1').textContent(),
      loadErrorVisible: async (page) =>
        page.getByText('DJs konnten nicht geladen werden').isVisible().catch(() => false),
      cardCount: async (page) => page.locator('article.card').count(),
      calendarLinkCount: async (page) =>
        page.locator('article.card a', { hasText: 'Termin im Kalender ansehen' }).count(),
      externalButtonCount: async (page) =>
        page.locator('article.card button', { hasText: 'Termin extern ansehen' }).count(),
      bodySnippet: async (page) => (await page.locator('body').innerText()).slice(0, 300)
    }),
    await inspectRoute('/links', {
      heading: async (page) => page.locator('h1').textContent(),
      tableCount: async (page) => page.locator('table').count(),
      firstTableVisible: async (page) => {
        const table = page.locator('table').first();
        return (await table.count()) > 0 ? table.isVisible() : false;
      },
      openLinkCount: async (page) => page.locator('table a', { hasText: 'Oeffnen' }).count(),
      bodySnippet: async (page) => (await page.locator('body').innerText()).slice(0, 300)
    })
  ];

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
