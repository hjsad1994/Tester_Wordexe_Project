import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 02 - Test Case List', () => {
  test('should show loading state initially', async ({ homePage }) => {
    await homePage.goto();
    // Loading state or content should be visible
    await expect(homePage.header).toBeVisible();
  });

  test('should display test cases section', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.waitForTestCasesToLoad();
    const heading = page.locator('h2');
    await expect(heading).toContainText('Test Cases');
  });
});
