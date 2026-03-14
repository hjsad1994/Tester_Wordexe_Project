import { test, expect } from '@playwright/test';
import { WishlistPage } from '../../pages/WishlistPage';
import { ProductsPage } from '../../pages/ProductsPage';

test.describe.serial('Demo User 01 - Wishlist Feature', () => {
  let wishlistPage: WishlistPage;
  let productsPage: ProductsPage;

  // Use fresh browser context for each test
  test.use({ 
    storageState: { cookies: [], origins: [] }
  });

  test.beforeEach(async ({ page }) => {
    wishlistPage = new WishlistPage(page);
    productsPage = new ProductsPage(page);
    
    // Đi đến trang chủ và force clear localStorage
    await page.goto('/');
    await page.evaluate(() => {
      // Clear all possible wishlist keys
      localStorage.clear();
      sessionStorage.clear();
      
      // Force clear specific keys
      ['baby-bliss-wishlist', 'baby-bliss-wishlist-guest', 'wishlist', 'wishlistItems'].forEach(key => {
        localStorage.removeItem(key);
      });
    });
    
    // Reload để context được reset
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display empty wishlist state', async ({ page }) => {
    await wishlistPage.goto();
    
    // Kiểm tra hiển thị empty state
    await expect(wishlistPage.emptyStateMessage).toBeVisible();
    await expect(wishlistPage.exploreProductsButton).toBeVisible();
    
    // Kiểm tra text mô tả
    await expect(page.locator('text=/Danh sách yêu thích trống/')).toBeVisible();
  });

  test('should add product to wishlist from products page', async ({ page }) => {
    // Đi đến trang sản phẩm
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    
    // Kiểm tra wishlist ban đầu
    await wishlistPage.goto();
    const initialCount = await wishlistPage.getWishlistItemCount();
    
    // Quay lại trang sản phẩm
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    
    // Thử thêm sản phẩm (tránh duplicate)
    const productIndex = Math.min(5, await productsPage.getProductCount() - 1);
    const productName = await productsPage.getProductNameByIndex(productIndex);
    
    // Thêm sản phẩm vào wishlist
    await productsPage.addToWishlistByIndex(productIndex);
    
    // Đợi context update
    await page.waitForTimeout(2000);
    
    // Đi đến trang wishlist
    await wishlistPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra sản phẩm đã được thêm
    const finalCount = await wishlistPage.getWishlistItemCount();
    expect(finalCount).toBe(initialCount + 1);
    await expect(page.locator(`text=${productName}`)).toBeVisible();
  });

  test('should add multiple products to wishlist', async ({ page }) => {
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    
    // Thêm 3 sản phẩm vào wishlist
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(300);
    await productsPage.addToWishlistByIndex(1);
    await page.waitForTimeout(300);
    await productsPage.addToWishlistByIndex(2);
    await page.waitForTimeout(300);
    
    // Đi đến trang wishlist
    await wishlistPage.goto();
    
    // Kiểm tra có 3 sản phẩm
    const count = await wishlistPage.getWishlistItemCount();
    expect(count).toBe(3);
    
    // Kiểm tra hiển thị số lượng
    await expect(wishlistPage.wishlistCount).toContainText('3 sản phẩm');
  });

  test('should remove product from wishlist', async ({ page }) => {
    // Thêm sản phẩm vào wishlist trước
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(2000);
    
    // Đi đến trang wishlist
    await wishlistPage.goto();
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra có sản phẩm trong wishlist
    const initialCount = await wishlistPage.getWishlistItemCount();
    expect(initialCount).toBeGreaterThan(0);
    
    // Xóa sản phẩm đầu tiên
    await wishlistPage.removeFromWishlistByIndex(0);
    await page.waitForTimeout(1000);
    
    // Kiểm tra số lượng giảm đi 1
    const finalCount = await wishlistPage.getWishlistItemCount();
    expect(finalCount).toBe(initialCount - 1);
    
    // Nếu không còn sản phẩm nào, kiểm tra empty state
    if (finalCount === 0) {
      await expect(wishlistPage.emptyStateMessage).toBeVisible();
    }
  });

  test('should clear all products from wishlist', async ({ page }) => {
    // Thêm nhiều sản phẩm
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(300);
    await productsPage.addToWishlistByIndex(1);
    await page.waitForTimeout(300);
    
    // Đi đến trang wishlist
    await wishlistPage.goto();
    
    // Xác nhận có sản phẩm
    const countBefore = await wishlistPage.getWishlistItemCount();
    expect(countBefore).toBeGreaterThan(0);
    
    // Xóa tất cả
    await wishlistPage.clearAllWishlist();
    await page.waitForTimeout(500);
    
    // Kiểm tra empty state
    await expect(wishlistPage.emptyStateMessage).toBeVisible();
  });

  test('should add product from wishlist to cart', async ({ page }) => {
    // Thêm sản phẩm vào wishlist
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(500);
    
    // Đi đến trang wishlist
    await wishlistPage.goto();
    
    // Thêm vào giỏ hàng
    await wishlistPage.addToCartByIndex(0);
    
    // Đợi toast notification
    await page.waitForTimeout(500);
    
    // Kiểm tra toast message xuất hiện
    await expect(page.locator('text=/Đã thêm vào giỏ hàng/')).toBeVisible();
  });

  test.skip('should persist wishlist after page reload', async ({ page }) => {
    // Thêm sản phẩm vào wishlist
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    const productName = await productsPage.getProductNameByIndex(0);
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(500);
    
    // Lấy số lượng sau khi thêm
    await wishlistPage.goto();
    const countAfterAdd = await wishlistPage.getWishlistItemCount();
    
    // Reload trang
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra số lượng vẫn giữ nguyên sau reload
    const countAfterReload = await wishlistPage.getWishlistItemCount();
    expect(countAfterReload).toBe(countAfterAdd);
    
    // Kiểm tra sản phẩm vẫn còn trong wishlist
    await expect(page.locator(`text=${productName}`)).toBeVisible();
  });

  test('should navigate to product detail from wishlist', async ({ page }) => {
    // Thêm sản phẩm vào wishlist
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(500);
    
    // Đi đến wishlist
    await wishlistPage.goto();
    
    // Click vào sản phẩm
    await wishlistPage.clickProductByIndex(0);
    
    // Kiểm tra đã chuyển đến trang chi tiết
    await page.waitForURL(/\/products\/.+/);
    expect(page.url()).toMatch(/\/products\/.+/);
  });

  test('should not add duplicate products to wishlist', async ({ page }) => {
    // Lấy số lượng ban đầu
    await wishlistPage.goto();
    const initialCount = await wishlistPage.getWishlistItemCount();
    
    await productsPage.goto();
    await productsPage.waitForProductsToLoad();
    
    // Thêm sản phẩm lần đầu
    await productsPage.addToWishlistByIndex(0);
    await page.waitForTimeout(300);
    
    // Kiểm tra sản phẩm đã trong wishlist (nút đã thay đổi)
    const isInWishlist = await productsPage.isProductInWishlist(0);
    expect(isInWishlist).toBe(true);
    
    // Click lần 2 sẽ xóa khỏi wishlist (không phải thêm duplicate)
    await productsPage.clickWishlistButtonByIndex(0);
    await page.waitForTimeout(300);
    
    // Đi đến wishlist
    await wishlistPage.goto();
    
    // Kiểm tra số lượng trở về ban đầu (đã bị xóa)
    const finalCount = await wishlistPage.getWishlistItemCount();
    expect(finalCount).toBe(initialCount);
  });
});
