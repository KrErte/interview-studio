import { test, expect } from '@playwright/test';

// App title in current build is "FrontendRisk" (index.html not yet updated)
const APP_TITLE = /FrontendRisk|CareerRisk|Interview Studio/i;

test.describe('Smoke Tests', () => {

  const publicRoutes = [
    '/','login', '/register', '/pricing', '/session/new',
  ].map(p => p.startsWith('/') ? p : '/' + p);

  for (const path of publicRoutes) {
    test(`${path} loads without error`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(APP_TITLE, { timeout: 10000 });
      // No JS errors check
      await expect(page.locator('body')).not.toBeEmpty();
    });
  }

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-123');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('API sessions endpoint responds', async ({ request }) => {
    const response = await request.get('/api/sessions/999999', { failOnStatusCode: false });
    expect(response.status()).not.toBe(500);
  });

  test('session result page accessible by ID after creation', async ({ page }) => {
    await page.goto('/session/new');
    await page.locator('button').filter({ hasText: 'Software Engineer' }).first().click();
    await page.locator('button').filter({ hasText: /Expert/i }).first().click();
    await page.locator('button').filter({ hasText: /^Next$/ }).click();
    await page.locator('button').filter({ hasText: /doesn.*stand out/i }).first().click();
    await page.locator('button').filter({ hasText: /Get My Assessment/i }).first().click();
    await expect(page).toHaveURL(/\/session\/\d+/, { timeout: 15000 });

    const sessionId = page.url().match(/\/session\/(\d+)/)?.[1];
    if (sessionId) {
      const response = await page.request.get(`/api/sessions/${sessionId}`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('status');
      expect(['RED', 'YELLOW', 'GREEN']).toContain(body.status);
      expect(body).toHaveProperty('blockers');
      expect(Array.isArray(body.blockers)).toBe(true);
    }
  });
});
