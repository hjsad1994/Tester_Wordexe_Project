import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productCards: Locator;
  readonly searchInput: Locator;
  readonly categoryButtons: Locator;
  readonly sortSelect: Locator;
  readonly priceRangeSelect: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    // Selector chính xác cho product cards trong grid
    this.productCards = page.locator('div[class*="grid"] > div[class*="group"]');
    this.searchInput = page.locator('input[aria-label="Tìm kiếm sản phẩm"]');
    this.categoryButtons = page.locator('button').filter({ hasText: /Tất cả|Quần áo|Bình sữa|Đồ chơi/ });
    this.sortSelect = page.locator('select[aria-label="Sắp xếp sản phẩm"]');
    this.priceRangeSelect = page.locator('select[aria-label="Lọc theo giá"]');
    this.loadingSpinner = page.locator('[class*="animate-pulse"]').first();
  }

  async goto() {
    await this.navigate('/products');
  }

  async waitForProductsToLoad() {
    await this.page.waitForLoadState('networkidle');
    // Wait for loading spinner to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async getProductNameByIndex(index: number): Promise<string | null> {
    const productCard = this.productCards.nth(index);
    const productName = productCard.locator('h3').first();
    return productName.textContent();
  }

  async addToWishlistByIndex(index: number) {
    const productCard = this.productCards.nth(index);
    // Chỉ click nếu chưa có trong wishlist (nút "Thêm vào yêu thích")
    const addButton = productCard.locator('button[aria-label="Thêm vào yêu thích"]');
    if (await addButton.isVisible()) {
      await addButton.click();
    } else {
      // Try to click any wishlist button if add button not found
      const anyWishlistBtn = productCard.locator('button[aria-label*="yêu thích"]').first();
      if (await anyWishlistBtn.isVisible()) {
        await anyWishlistBtn.click();
      }
    }
  }

  async isProductInWishlist(index: number): Promise<boolean> {
    const productCard = this.productCards.nth(index);
    const removeButton = productCard.locator('button[aria-label="Xóa khỏi yêu thích"]');
    return removeButton.isVisible();
  }

  async clickWishlistButtonByIndex(index: number) {
    const productCard = this.productCards.nth(index);
    const wishlistButton = productCard.locator('button[aria-label*="yêu thích"]').first();
    await wishlistButton.click();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async searchProduct(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForLoadState('networkidle');
  }

  async selectCategory(categoryName: string) {
    const categoryButton = this.page.locator('button').filter({ hasText: categoryName }).first();
    await categoryButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async sortBy(sortOption: string) {
    await this.sortSelect.selectOption(sortOption);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPrice(priceRange: string) {
    await this.priceRangeSelect.selectOption(priceRange);
    await this.page.waitForLoadState('networkidle');
  }
}
