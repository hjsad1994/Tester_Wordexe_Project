import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 09 - Screenshot Testing', () => {
  test('should take homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png', { maxDiffPixelRatio: 0.1 });
  });

  test('should take header screenshot', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header.png', { maxDiffPixelRatio: 0.1 });
  });
});
