import { type ChildProcess, spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const API_URL = 'http://127.0.0.1:3001';
const backendDir = path.resolve(__dirname, '../../../backend');
const envPath = path.join(backendDir, '.env');

let backendProcess: ChildProcess | null = null;
let backendStarted = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEnvValue = (content: string, key: string) => {
  const line = content
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) {
    return null;
  }

  const raw = line.slice(key.length + 1).trim();
  if (!raw) {
    return null;
  }

  return raw.replace(/^['"]|['"]$/g, '');
};

const resolveJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    return parseEnvValue(envContent, 'JWT_SECRET');
  } catch {
    return null;
  }
};

const base64Url = (value: string) => Buffer.from(value).toString('base64url');

const signJwt = (payload: Record<string, unknown>, secret: string) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const makeAdminCookie = (secret: string) => {
  const token = signJwt(
    {
      userId: '000000000000000000000001',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    secret
  );

  return `accessToken=${token}`;
};

const waitForBackendReady = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        return;
      }
    } catch {}
    await sleep(500);
  }

  throw new Error('Backend failed to become ready on /health');
};

const registerAndLoginUser = async (
  request: Parameters<typeof test>[0]['request'],
  label: string
) => {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `inventory-${label}-${unique}@example.com`;
  const password = 'Test@12345';

  const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
    data: {
      name: `Inventory User ${label}`,
      email,
      phone: `09${`${Date.now()}`.slice(-8)}`,
      password,
    },
  });
  expect(registerResponse.status()).toBe(201);

  const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
    data: { email, password },
  });
  expect(loginResponse.status()).toBe(200);

  const cookie = loginResponse.headers()['set-cookie'];
  expect(cookie).toBeTruthy();

  return cookie;
};

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'Inventory API suite starts its own backend process'
);

test.beforeAll(async ({ browserName }) => {
  if (browserName !== 'chromium') {
    return;
  }

  backendProcess = spawn('npm', ['run', 'start'], {
    cwd: backendDir,
    env: process.env,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });

  await waitForBackendReady();
  backendStarted = true;
});

test.afterAll(async () => {
  if (!backendStarted || !backendProcess) {
    return;
  }

  backendProcess.kill('SIGTERM');
  backendProcess = null;
  backendStarted = false;
});

test.describe('Inventory API - Stock lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  let adminCookie = '';
  let userCookie = '';
  let categoryId = '';
  let productId = '';
  let orderId = '';
  let concurrentProductId = '';

  test.afterAll(async ({ request }) => {
    if (adminCookie && concurrentProductId) {
      await request.delete(`${API_URL}/api/products/${concurrentProductId}`, {
        headers: { Cookie: adminCookie },
      });
    }

    if (adminCookie && productId) {
      await request.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Cookie: adminCookie },
      });
    }

    if (adminCookie && categoryId) {
      await request.delete(`${API_URL}/api/categories/${categoryId}`, {
        headers: { Cookie: adminCookie },
      });
    }
  });

  test('TC-INV-API-01: tạo dữ liệu tồn kho ban đầu (category + product)', async ({ request }) => {
    const secret = resolveJwtSecret();
    expect(secret).toBeTruthy();

    adminCookie = makeAdminCookie(secret as string);
    userCookie = await registerAndLoginUser(request, 'main');

    const categoryResponse = await request.post(`${API_URL}/api/categories`, {
      headers: { Cookie: adminCookie },
      data: {
        name: `INV Category ${Date.now()}`,
        description: 'Inventory test category',
      },
    });
    expect(categoryResponse.status()).toBe(201);
    categoryId = (await categoryResponse.json()).data._id as string;

    const productResponse = await request.post(`${API_URL}/api/products`, {
      headers: { Cookie: adminCookie },
      data: {
        name: `INV Product ${Date.now()}`,
        price: 180000,
        quantity: 5,
        category: categoryId,
        description: 'Inventory test product',
      },
    });
    expect(productResponse.status()).toBe(201);

    const productBody = await productResponse.json();
    productId = productBody.data._id as string;
    expect(productBody.data.quantity).toBe(5);
  });

  test('TC-INV-API-02: đặt đơn thành công phải trừ tồn kho tương ứng', async ({ request }) => {
    test.fail(true, 'Pending backend stock deduction implementation');

    const createOrderResponse = await request.post(`${API_URL}/api/orders`, {
      headers: {
        Cookie: userCookie,
        'Content-Type': 'application/json',
      },
      data: {
        items: [{ productId, quantity: 3 }],
        paymentMethod: 'cod',
        customerInfo: {
          fullName: 'Inventory Test User',
          phone: '0912345678',
          address: '123 Nguyen Hue, Quan 1',
          notes: 'Playwright inventory test',
        },
      },
    });
    expect(createOrderResponse.status()).toBe(201);

    const createdOrderBody = await createOrderResponse.json();
    orderId = createdOrderBody.data._id as string;

    const productAfterOrder = await request.get(`${API_URL}/api/products/${productId}`);
    expect(productAfterOrder.status()).toBe(200);

    const productBody = await productAfterOrder.json();
    expect(productBody.data.quantity).toBe(2);
  });

  test('TC-INV-API-03: đơn vượt tồn kho phải bị chặn', async ({ request }) => {
    test.fail(true, 'Pending backend stock validation implementation');

    const overOrderResponse = await request.post(`${API_URL}/api/orders`, {
      headers: {
        Cookie: userCookie,
        'Content-Type': 'application/json',
      },
      data: {
        items: [{ productId, quantity: 3 }],
        paymentMethod: 'cod',
        customerInfo: {
          fullName: 'Inventory Test User',
          phone: '0912345678',
          address: '123 Nguyen Hue, Quan 1',
          notes: 'Over stock order',
        },
      },
    });

    expect(overOrderResponse.status()).toBe(422);
    const body = await overOrderResponse.json();
    expect(String(body.message || '').length).toBeGreaterThan(0);
  });

  test('TC-INV-API-04: hủy đơn phải hoàn lại tồn kho', async ({ request }) => {
    const cancelResponse = await request.patch(`${API_URL}/api/orders/${orderId}/status`, {
      headers: {
        Cookie: adminCookie,
        'Content-Type': 'application/json',
      },
      data: { status: 'cancelled' },
    });
    expect(cancelResponse.status()).toBe(200);

    const productAfterCancel = await request.get(`${API_URL}/api/products/${productId}`);
    expect(productAfterCancel.status()).toBe(200);

    const productBody = await productAfterCancel.json();
    expect(productBody.data.quantity).toBe(5);
  });

  test('TC-INV-API-05: 2 đơn đồng thời không được bán vượt kho', async ({ request }) => {
    test.fail(true, 'Pending backend race-condition protection implementation');

    const concurrentCategoryResponse = await request.post(`${API_URL}/api/categories`, {
      headers: { Cookie: adminCookie },
      data: {
        name: `INV Race Category ${Date.now()}`,
        description: 'Inventory race test category',
      },
    });
    expect(concurrentCategoryResponse.status()).toBe(201);
    const concurrentCategoryId = (await concurrentCategoryResponse.json()).data._id as string;

    const concurrentProductResponse = await request.post(`${API_URL}/api/products`, {
      headers: { Cookie: adminCookie },
      data: {
        name: `INV Race Product ${Date.now()}`,
        price: 99000,
        quantity: 1,
        category: concurrentCategoryId,
        description: 'Race test product',
      },
    });
    expect(concurrentProductResponse.status()).toBe(201);

    const concurrentProductBody = await concurrentProductResponse.json();
    concurrentProductId = concurrentProductBody.data._id as string;

    const raceBuyerCookie = await registerAndLoginUser(request, 'race');
    const payload = {
      items: [{ productId: concurrentProductId, quantity: 1 }],
      paymentMethod: 'cod',
      customerInfo: {
        fullName: 'Race Inventory User',
        phone: '0912345678',
        address: '123 Nguyen Hue, Quan 1',
        notes: 'Race condition order',
      },
    };

    const [attemptA, attemptB] = await Promise.all([
      request.post(`${API_URL}/api/orders`, {
        headers: {
          Cookie: raceBuyerCookie,
          'Content-Type': 'application/json',
        },
        data: payload,
      }),
      request.post(`${API_URL}/api/orders`, {
        headers: {
          Cookie: raceBuyerCookie,
          'Content-Type': 'application/json',
        },
        data: payload,
      }),
    ]);

    const statuses = [attemptA.status(), attemptB.status()];
    const successCount = statuses.filter((status) => status === 201).length;
    const failureCount = statuses.filter((status) => status >= 400).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const productAfterRace = await request.get(`${API_URL}/api/products/${concurrentProductId}`);
    expect(productAfterRace.status()).toBe(200);
    expect((await productAfterRace.json()).data.quantity).toBe(0);

    await request.delete(`${API_URL}/api/products/${concurrentProductId}`, {
      headers: { Cookie: adminCookie },
    });
    concurrentProductId = '';

    await request.delete(`${API_URL}/api/categories/${concurrentCategoryId}`, {
      headers: { Cookie: adminCookie },
    });
  });
});
