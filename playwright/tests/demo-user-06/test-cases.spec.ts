import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Demo User 06 - Navigation Links', () => {
  test('should verify current URL', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/localhost:3000/);
  });

  test('should have correct base URL', async ({ page, baseURL }) => {
    await page.goto('/');
    expect(baseURL).toBe('http://localhost:3000');
  });
});
