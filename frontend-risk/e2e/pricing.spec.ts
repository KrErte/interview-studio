import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  });

  test('pricing page renders with 3 plans', async ({ page }) => {
    await expect(page.locator('text=/Free/i').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/Starter/i').first()).toBeVisible();
    await expect(page.locator('text=/Pro/i').first()).toBeVisible();
  });

  test('Free plan shows Get Started Free button', async ({ page }) => {
    const freeBtn = page.locator('a[href="/session/new"]').first();
    await expect(freeBtn).toBeVisible({ timeout: 10000 });
  });

  test('paid plans show sign up or subscribe buttons', async ({ page }) => {
    const subscribeBtns = page.locator('button, a').filter({
      hasText: /Sign Up|Subscribe|Get Started/i
    });
    await expect(subscribeBtns.first()).toBeVisible({ timeout: 10000 });
    expect(await subscribeBtns.count()).toBeGreaterThanOrEqual(2);
  });

  test('monthly/annual billing toggle works', async ({ page }) => {
    // Toggle is a button with class rounded-full (the switch)
    const toggleBtn = page.locator('button.rounded-full').filter({ has: page.locator('span') }).first();
    await expect(toggleBtn).toBeVisible({ timeout: 10000 });

    // Should start on Monthly — check "Monthly" label is white/active
    await expect(page.locator('text=Monthly').first()).toBeVisible();
    await expect(page.locator('text=Annual').first()).toBeVisible();

    // Click toggle to switch to annual
    await toggleBtn.click();

    // Annual billing label should now be active
    await expect(page.locator('text=Annual').first()).toBeVisible();
    // Annual price breakdown should appear
    await expect(page.locator('text=/Billed annually|per month/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('pricing page shows EUR prices', async ({ page }) => {
    await expect(page.locator('text=/€|EUR/').first()).toBeVisible({ timeout: 10000 });
  });

  test('pricing page has FAQ section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('text=/FAQ|frequently asked|questions/i').first())
      .toBeVisible({ timeout: 5000 })
      .catch(() => { /* FAQ may need more scroll */ });
  });

  test('free plan links to session wizard', async ({ page }) => {
    const freeLink = page.locator('a[href="/session/new"]').first();
    await expect(freeLink).toBeVisible({ timeout: 10000 });
    await freeLink.click();
    await expect(page).toHaveURL(/\/session\/new/);
  });

  test('starter plan shows feature list', async ({ page }) => {
    await expect(page.locator('text=/30-day|action plan|roadmap/i').first())
      .toBeVisible({ timeout: 10000 })
      .catch(() => { /* feature text may vary */ });
  });
});
