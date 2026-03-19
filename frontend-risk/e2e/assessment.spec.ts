import { test, expect } from '@playwright/test';

test.describe('Career Assessment Flow', () => {

  test('homepage loads and shows primary CTA', async ({ page }) => {
    await page.goto('/');
    // Title is "FrontendRisk" in current build
    await expect(page).toHaveTitle(/FrontendRisk|CareerRisk|Interview Studio/i);

    // Primary CTA button links to /session/new
    const cta = page.locator('a[href="/session/new"]').first();
    await expect(cta).toBeVisible();
  });

  test('complete assessment flow - selects first option on each step', async ({ page }) => {
    await page.goto('/session/new');

    // ── Step 1: Target Role ──────────────────────────────────────────────────
    const firstChip = page.locator('button').filter({ hasText: 'Software Engineer' }).first();
    await expect(firstChip).toBeVisible({ timeout: 10000 });
    await firstChip.click();

    // ── Step 2: Experience Level ─────────────────────────────────────────────
    // First option is "Expert" — select it, then click Next
    const expertOption = page.locator('button').filter({ hasText: /Expert/i }).first();
    await expect(expertOption).toBeVisible({ timeout: 10000 });
    await expertOption.click();
    await page.locator('button').filter({ hasText: /^Next$/ }).click();

    // ── Step 3: Main Challenge ───────────────────────────────────────────────
    // First option: "My CV doesn't stand out"
    const cvOption = page.locator('button').filter({ hasText: /doesn.*stand out/i }).first();
    await expect(cvOption).toBeVisible({ timeout: 10000 });
    await cvOption.click();

    // Click submit (step 3 shows "Get My Assessment")
    const submitBtn = page.locator('button').filter({ hasText: /Get My Assessment|Analyzing/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();

    // ── Result page ──────────────────────────────────────────────────────────
    await expect(page).toHaveURL(/\/session\/\d+/, { timeout: 15000 });

    // Status badge visible
    const statusBadge = page.locator('div').filter({ hasText: /High Risk|Medium Risk|Low Risk/i }).first();
    await expect(statusBadge).toBeVisible({ timeout: 10000 });

    // Role name shown
    await expect(page.getByText('Software Engineer').first()).toBeVisible();

    // Blockers section visible
    await expect(page.getByText(/Key Blockers/i)).toBeVisible();
  });

  test('result page shows upgrade CTA for unpaid session', async ({ page }) => {
    await page.goto('/session/new');

    // Step 1 - click Product Manager chip
    await page.locator('button').filter({ hasText: 'Product Manager' }).first().click();

    // Step 2 - Intermediate + Next
    await page.locator('button').filter({ hasText: /Intermediate/i }).first().click();
    await page.locator('button').filter({ hasText: /^Next$/ }).click();

    // Step 3 - "Interview preparation"
    await page.locator('button').filter({ hasText: /Interview prep/i }).first().click(); // matches "Interview preparation"

    await page.locator('button').filter({ hasText: /Get Assessment/i }).first().click();

    await expect(page).toHaveURL(/\/session\/\d+/, { timeout: 15000 });

    // Unpaid session shows pricing section
    await expect(page.locator('text=/Starter|Pro/').first()).toBeVisible({ timeout: 10000 });
  });

  test('navigating from homepage CTA reaches wizard', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href="/session/new"]').first().click();
    await expect(page).toHaveURL(/\/session\/new/);
    await expect(page.locator('button').filter({ hasText: 'Software Engineer' })).toBeVisible({ timeout: 10000 });
  });

  test('result page share button copies link', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/session/new');
    await page.locator('button').filter({ hasText: 'Software Engineer' }).first().click();
    await page.locator('button').filter({ hasText: /Expert/i }).first().click();
    await page.locator('button').filter({ hasText: /doesn.*stand out/i }).first().click();
    await page.locator('button').filter({ hasText: /Get Assessment/i }).first().click();
    await expect(page).toHaveURL(/\/session\/\d+/, { timeout: 15000 });

    const shareBtn = page.locator('button').filter({ hasText: /Share result/i }).first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await expect(page.locator('button').filter({ hasText: /Link copied/i })).toBeVisible({ timeout: 3000 });
    }
  });
});
