import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class WishlistPage extends BasePage {
  readonly productCards: Locator;
  readonly emptyStateMessage: Locator;
  readonly exploreProductsButton: Locator;
  readonly wishlistCount: Locator;
  readonly clearAllButton: Locator;

  constructor(page: Page) {
    super(page);
    // Selector chính xác cho wishlist items - div có chứa h3 (tên sản phẩm)
    this.productCards = page.locator('div.grid > div').filter({ has: page.locator('h3') });
    this.emptyStateMessage = page.locator('text=/Danh sách yêu thích trống/');
    this.exploreProductsButton = page.locator('a').filter({ hasText: /Khám phá sản phẩm/ });
    this.wishlistCount = page.locator('p').filter({ hasText: /sản phẩm trong danh sách yêu thích/ });
    this.clearAllButton = page.locator('button').filter({ hasText: /Xóa tất cả/ });
  }

  async goto() {
    await this.navigate('/wishlist');
  }

  async getWishlistItemCount(): Promise<number> {
    return this.productCards.count();
  }

  async removeFromWishlistByIndex(index: number) {
    // Lấy product card cụ thể theo index
    const productCard = this.productCards.nth(index);
    
    // Tìm button xóa có TrashIcon - button này nằm trong actions area
    const removeButton = productCard.locator('button').filter({ 
      has: this.page.locator('svg') 
    }).nth(1); // Button thứ 2 (0: add to cart, 1: remove)
    
    await removeButton.click();
  }

  async addToCartByIndex(index: number) {
    const productCard = this.productCards.nth(index);
    const addToCartButton = productCard.locator('button').filter({ hasText: /Thêm giỏ/ }).first();
    await addToCartButton.click();
  }

  async clearAllWishlist() {
    await this.clearAllButton.click();
  }

  async getProductNameByIndex(index: number): Promise<string | null> {
    const productCard = this.productCards.nth(index);
    const productName = productCard.locator('h3').first();
    return productName.textContent();
  }

  async clickProductByIndex(index: number) {
    const productCard = this.productCards.nth(index);
    const productLink = productCard.locator('a').first();
    await productLink.click();
  }
}
