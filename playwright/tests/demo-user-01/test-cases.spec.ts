import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 01 - Homepage Navigation', () => {
  test('should display the homepage correctly', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.header).toBeVisible();
  });

  test('should show the correct page title', async ({ homePage, page }) => {
    await homePage.goto();
    await expect(page).toHaveTitle(/Playwright Demo/i);
  });
});
