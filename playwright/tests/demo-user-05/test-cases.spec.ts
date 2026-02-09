import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 05 - API Response Verification', () => {
  test('should intercept and verify API calls', async ({ page }) => {
    await page.route('**/api/test-cases', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/test-cases', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'Server error' }),
      });
    });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
