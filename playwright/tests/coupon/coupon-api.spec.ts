import { type ChildProcess, spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = 'http://127.0.0.1:3001';
const backendDir = path.resolve(__dirname, '../../../backend');
const envPath = path.join(backendDir, '.env');

let backendProcess: ChildProcess | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── JWT helpers (same pattern as rbac tests) ────────────────────────────────

const parseEnvValue = (content: string, key: string) => {
  const line = content
    .split('\n')
    .map((e) => e.trim())
    .find((e) => e.startsWith(`${key}=`));
  if (!line) return null;
  const raw = line.slice(key.length + 1).trim();
  return raw.replace(/^['"]|['"]$/g, '') || null;
};

const resolveJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  try {
    const content = readFileSync(envPath, 'utf8');
    return parseEnvValue(content, 'JWT_SECRET');
  } catch {
    return null;
  }
};

const base64Url = (v: string) => Buffer.from(v).toString('base64url');

const signJwt = (payload: Record<string, unknown>, secret: string) => {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
};

const makeAdminCookie = (secret: string) => {
  const token = signJwt(
    { userId: '000000000000000000000001', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 },
    secret
  );
  return `accessToken=${token}`;
};

// ─── Backend lifecycle ────────────────────────────────────────────────────────

const waitForBackend = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('Backend không khởi động được');
};

test.beforeAll(async () => {
  backendProcess = spawn('npm', ['run', 'start'], {
    cwd: backendDir,
    env: process.env,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  await waitForBackend();
});

test.afterAll(() => {
  backendProcess?.kill('SIGTERM');
  backendProcess = null;
});

// ─── Coupon CRUD lifecycle ───────────────────────────────────────────────────

test.describe('API Khuyến Mãi - Coupon CRUD (Backend thực)', () => {
  test.describe.configure({ mode: 'serial' });

  let adminCookie: string;
  let createdCouponId: string;
  let createdCouponCode: string;
  let userCookie: string;

  // ── Setup: lấy JWT admin + đăng ký user thường ────────────────────────────

  test('TC-API-01: Khởi tạo - lấy JWT admin và đăng ký user thường', async ({ request }) => {
    const secret = resolveJwtSecret();
    expect(secret, 'JWT_SECRET phải có trong backend/.env').toBeTruthy();
    adminCookie = makeAdminCookie(secret as string);

    // Đăng ký user thường
    const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const email = `coupon-test-${uniqueSuffix}@example.com`;
    const reg = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        name: 'Coupon Test User',
        email,
        phone: `09${uniqueSuffix.slice(-8)}`,
        password: 'Test@12345',
      },
    });
    expect(reg.status()).toBe(201);

    const login = await request.post(`${API_URL}/api/auth/login`, {
      data: { email, password: 'Test@12345' },
    });
    expect(login.status()).toBe(200);
    userCookie = login.headers()['set-cookie'];
    expect(userCookie).toBeTruthy();
  });

  // ── CREATE ────────────────────────────────────────────────────────────────

  test('TC-API-02: Admin tạo mã khuyến mãi mới (percentage)', async ({ request }) => {
    const couponCode = `TEST${Date.now()}`;
    const res = await request.post(`${API_URL}/api/coupons`, {
      headers: { Cookie: adminCookie },
      data: {
        code: couponCode,
        name: 'Mã test Playwright',
        description: 'Tạo bởi Playwright E2E test',
        discountType: 'percentage',
        discountValue: 15,
        maximumDiscount: 75000,
        minimumOrderAmount: 150000,
        usageLimit: 50,
        perUserLimit: 1,
        isActive: true,
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.data.code).toBe(couponCode);
    expect(body.data.discountType).toBe('percentage');
    expect(body.data.discountValue).toBe(15);
    expect(body.data.isActive).toBe(true);

    createdCouponId = body.data._id as string;
    createdCouponCode = body.data.code as string;
    expect(createdCouponId).toBeTruthy();
  });

  test('TC-API-03: Admin tạo mã trùng code → 400 lỗi', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/coupons`, {
      headers: { Cookie: adminCookie },
      data: {
        code: createdCouponCode, // trùng code với TC-API-02
        name: 'Mã trùng',
        discountType: 'fixed_amount',
        discountValue: 10000,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.message).toContain('already exists');
  });

  // ── READ ──────────────────────────────────────────────────────────────────

  test('TC-API-04: Admin lấy danh sách tất cả coupon', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/coupons`, {
      headers: { Cookie: adminCookie },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Coupon vừa tạo phải có trong danh sách
    const found = body.data.some((c: { _id: string }) => c._id === createdCouponId);
    expect(found).toBe(true);
  });

  test('TC-API-05: Admin lấy chi tiết coupon theo ID', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data._id).toBe(createdCouponId);
    expect(body.data.discountType).toBe('percentage');
  });

  test('TC-API-06: Public lấy danh sách coupon khả dụng (không cần auth)', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/coupons/available`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────

  test('TC-API-07: Admin cập nhật tên và giá trị coupon', async ({ request }) => {
    const res = await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
      data: {
        name: 'Mã test Playwright - Đã cập nhật',
        discountValue: 20,
        maximumDiscount: 100000,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.name).toBe('Mã test Playwright - Đã cập nhật');
    expect(body.data.discountValue).toBe(20);
    expect(body.data.maximumDiscount).toBe(100000);
  });

  test('TC-API-08: Admin vô hiệu hóa coupon (isActive: false)', async ({ request }) => {
    const res = await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
      data: { isActive: false },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.isActive).toBe(false);
  });

  test('TC-API-09: Admin kích hoạt lại coupon (isActive: true)', async ({ request }) => {
    const res = await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
      data: { isActive: true },
    });

    expect(res.status()).toBe(200);
    expect((await res.json()).data.isActive).toBe(true);
  });

  // ── VALIDATE coupon ───────────────────────────────────────────────────────

  test('TC-API-10: User validate mã hợp lệ → trả về discountAmount', async ({ request }) => {
    // Lấy code
    const detail = await request.get(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });
    const coupon = (await detail.json()).data;

    const res = await request.post(`${API_URL}/api/coupons/validate`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { code: coupon.code, subtotal: 500000 },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.valid).toBe(true);
    expect(body.data.coupon.code).toBe(coupon.code);
    expect(typeof body.data.discountAmount).toBe('number');
    expect(body.data.discountAmount).toBeGreaterThan(0);
  });

  test('TC-API-11: Validate đơn hàng dưới mức tối thiểu → 400 lỗi', async ({ request }) => {
    const detail = await request.get(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });
    const coupon = (await detail.json()).data;

    // subtotal = 10000, nhỏ hơn minimumOrderAmount = 150000
    const res = await request.post(`${API_URL}/api/coupons/validate`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { code: coupon.code, subtotal: 10000 },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.message).toContain('tối thiểu');
  });

  test('TC-API-12: Validate mã không tồn tại → 400 lỗi', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/coupons/validate`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { code: 'MAKHONGTONTAI999', subtotal: 500000 },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.message).toContain('không tồn tại');
  });

  test('TC-API-13: Validate mã đã vô hiệu hóa → 400 lỗi', async ({ request }) => {
    // Tắt coupon trước
    await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
      data: { isActive: false },
    });

    const detail = await request.get(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });
    const coupon = (await detail.json()).data;

    const res = await request.post(`${API_URL}/api/coupons/validate`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { code: coupon.code, subtotal: 500000 },
    });

    expect(res.status()).toBe(422);
    expect((await res.json()).message).toContain('vô hiệu hóa');

    // Bật lại để test tiếp
    await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
      data: { isActive: true },
    });
  });

  // ── RBAC ─────────────────────────────────────────────────────────────────

  test('TC-API-14: Non-admin bị từ chối (403) khi tạo coupon', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/coupons`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { code: 'HACK123', name: 'Hack', discountType: 'fixed_amount', discountValue: 9999999 },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-API-15: Non-admin bị từ chối (403) khi sửa coupon', async ({ request }) => {
    const res = await request.put(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: userCookie, 'Content-Type': 'application/json' },
      data: { discountValue: 99 },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-API-16: Non-admin bị từ chối (403) khi xóa coupon', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: userCookie },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-API-17: Non-admin bị từ chối (403) khi lấy danh sách admin', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/coupons`, {
      headers: { Cookie: userCookie },
    });
    expect(res.status()).toBe(403);
  });

  test('TC-API-18: Unauthenticated bị từ chối (401) khi validate coupon', async ({ request }) => {
    const detail = await request.get(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });
    const coupon = (await detail.json()).data;

    // Không có cookie auth
    const res = await request.post(`${API_URL}/api/coupons/validate`, {
      data: { code: coupon.code, subtotal: 500000 },
    });
    expect(res.status()).toBe(401);
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  test('TC-API-19: Admin xóa coupon chưa được dùng', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/coupons/${createdCouponId}`, {
      headers: { Cookie: adminCookie },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
  });

  test('TC-API-20: Coupon đã xóa không còn trong danh sách', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/coupons`, {
      headers: { Cookie: adminCookie },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const found = body.data.some((c: { _id: string }) => c._id === createdCouponId);
    expect(found).toBe(false);
  });
});
