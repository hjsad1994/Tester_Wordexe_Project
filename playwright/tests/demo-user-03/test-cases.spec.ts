import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 03 - Click Interactions', () => {
  test('should be able to click on header', async ({ homePage }) => {
    await homePage.goto();
    await homePage.header.click();
    await expect(homePage.header).toBeVisible();
  });

  test('should verify element count in navigation', async ({ homePage, page }) => {
    await homePage.goto();
    const navElements = page.locator('nav');
    await expect(navElements).toHaveCount(1);
  });
});
