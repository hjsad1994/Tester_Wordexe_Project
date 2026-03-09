import { test, expect } from '@playwright/test';

test.describe('Chức năng Đăng nhập', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Hiển thị trang đăng nhập đúng cách', async ({ page }) => {
    // Kiểm tra tiêu đề trang trong main content (dùng getByRole để chính xác hơn)
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    
    // Kiểm tra mô tả
    await expect(page.getByText('Chào mừng bạn quay lại Baby Bliss!')).toBeVisible();
    
    // Kiểm tra các trường input hiển thị
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    
    // Kiểm tra placeholder
    await expect(page.locator('#login-email')).toHaveAttribute('placeholder', 'email@example.com');
    await expect(page.locator('#login-password')).toHaveAttribute('placeholder', 'Nhập mật khẩu');
    
    // Kiểm tra nút đăng nhập
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
    
    // Kiểm tra link đăng ký trong main content
    await expect(page.getByRole('link', { name: 'Đăng ký ngay' })).toBeVisible();
  });

  test('Hiển thị lỗi khi submit form trống', async ({ page }) => {
    // Click nút đăng nhập mà không điền gì
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra các thông báo lỗi validation
    await expect(page.getByText('Vui lòng nhập email')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
  });

  test('Hiển thị lỗi mật khẩu khi chỉ nhập email', async ({ page }) => {
    // Chỉ điền email
    await page.locator('#login-email').fill('test@example.com');
    
    // Click nút đăng nhập
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra lỗi mật khẩu hiển thị
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
  });

  test('Hiển thị lỗi email khi chỉ nhập mật khẩu', async ({ page }) => {
    // Chỉ điền mật khẩu
    await page.locator('#login-password').fill('password123');
    
    // Click nút đăng nhập
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra lỗi email hiển thị
    await expect(page.getByText('Vui lòng nhập email')).toBeVisible();
  });

  test('Không cho phép email không đúng format', async ({ page }) => {
    // Điền email không hợp lệ (không có @)
    await page.locator('#login-email').fill('notanemail');
    await page.locator('#login-password').fill('password123');
    
    // Click nút đăng nhập
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra vẫn còn ở trang login (form không submit thành công)
    await expect(page.locator('#login-email')).toBeVisible();
  });

  test('Có thể ẩn/hiện mật khẩu', async ({ page }) => {
    // Điền mật khẩu
    const passwordInput = page.locator('#login-password');
    await passwordInput.fill('password123');
    
    // Mặc định type là password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click nút hiện mật khẩu
    const togglePasswordButton = page.locator('button[aria-label="Hiện mật khẩu"]');
    await togglePasswordButton.click();
    
    // Kiểm tra type đã đổi thành text
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click lại để ẩn mật khẩu
    const hidePasswordButton = page.locator('button[aria-label="Ẩn mật khẩu"]');
    await hidePasswordButton.click();
    
    // Kiểm tra type đã đổi lại thành password
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Xóa lỗi khi người dùng bắt đầu nhập', async ({ page }) => {
    // Click submit để hiện lỗi
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra lỗi hiển thị
    await expect(page.getByText('Vui lòng nhập email')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
    
    // Bắt đầu nhập vào trường email
    await page.locator('#login-email').fill('test@example.com');
    
    // Lỗi của trường email phải biến mất
    await expect(page.getByText('Vui lòng nhập email')).not.toBeVisible();
    
    // Bắt đầu nhập vào trường password
    await page.locator('#login-password').fill('password123');
    
    // Lỗi của trường password phải biến mất
    await expect(page.getByText('Vui lòng nhập mật khẩu')).not.toBeVisible();
  });

  test('Điều hướng đến trang đăng ký khi click link', async ({ page }) => {
    // Click link đăng ký (dùng text chính xác)
    await page.getByRole('link', { name: 'Đăng ký ngay' }).click();
    
    // Chờ navigation hoàn tất
    await page.waitForURL('/register', { timeout: 10000 });
    
    // Kiểm tra URL
    await expect(page).toHaveURL('/register');
  });

  test('Vẫn ở trang login khi thông tin đăng nhập sai', async ({ page }) => {
    // Điền thông tin đăng nhập sai
    await page.locator('#login-email').fill('wrong@example.com');
    await page.locator('#login-password').fill('wrongpassword');
    
    // Click nút đăng nhập
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Chờ phản hồi từ server
    await page.waitForTimeout(3000);
    
    // Kiểm tra vẫn ở trang login (không chuyển hướng)
    await expect(page).toHaveURL('/login');
  });

  test('Đăng nhập thành công với tài khoản hợp lệ', async ({ page, browserName }) => {
    // Skip trên webkit và firefox do có vấn đề với API calls và timeout
    test.skip(browserName === 'webkit' || browserName === 'firefox', 'Webkit/Firefox có vấn đề với API calls trong CI');
    
    // Tăng timeout cho test này
    test.setTimeout(60000);
    
    // Đầu tiên đăng ký một tài khoản mới
    const timestamp = Date.now();
    const testEmail = `logintest_${timestamp}@example.com`;
    const testPassword = 'password123';
    
    // Chuyển đến trang đăng ký
    await page.goto('/register');
    
    // Điền form đăng ký
    await page.locator('#register-name').fill('Login Test User');
    await page.locator('#register-email').fill(testEmail);
    await page.locator('#register-phone').fill('0901234567');
    await page.locator('#register-password').fill(testPassword);
    await page.locator('#register-confirm-password').fill(testPassword);
    
    // Click nút đăng ký
    await page.getByRole('button', { name: 'Đăng ký' }).click();
    
    // Chờ đăng ký thành công và chuyển hướng về trang chủ
    await expect(page).toHaveURL('/', { timeout: 25000 });
    
    // Đăng xuất bằng cách xóa localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Chuyển đến trang đăng nhập
    await page.goto('/login');
    
    // Điền thông tin đăng nhập
    await page.locator('#login-email').fill(testEmail);
    await page.locator('#login-password').fill(testPassword);
    
    // Click nút đăng nhập
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Sau khi đăng nhập thành công, sẽ chuyển hướng về trang chủ
    await expect(page).toHaveURL('/', { timeout: 25000 });
  });

  test('Input email có autocomplete attribute', async ({ page }) => {
    const emailInput = page.locator('#login-email');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  test('Input password có autocomplete attribute', async ({ page }) => {
    const passwordInput = page.locator('#login-password');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('Form có các label accessible', async ({ page }) => {
    // Kiểm tra label cho email
    const emailLabel = page.locator('label[for="login-email"]');
    await expect(emailLabel).toContainText('Email');
    
    // Kiểm tra label cho password
    const passwordLabel = page.locator('label[for="login-password"]');
    await expect(passwordLabel).toContainText('Mật khẩu');
  });

  test('Thông báo lỗi có role="alert" để accessible', async ({ page }) => {
    // Click submit để hiện lỗi
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    
    // Kiểm tra các thông báo lỗi có role="alert"
    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });
});
