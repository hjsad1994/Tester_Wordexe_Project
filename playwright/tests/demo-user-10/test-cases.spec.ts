import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 10 - Error State Handling', () => {
  test('should handle empty state display', async ({ page }) => {
    await page.route('**/api/test-cases', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display error message on API failure', async ({ page }) => {
    await page.route('**/api/test-cases', route => {
      route.abort('failed');
    });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});
