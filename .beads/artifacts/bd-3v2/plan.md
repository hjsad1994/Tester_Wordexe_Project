# Checkout Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `skill({ name: "executing-plans" })` to implement this plan task-by-task.

**Goal:** Build a checkout flow with COD + MoMo payment, accessible from cart ("Thanh toán") and product detail ("Mua ngay").

**Architecture:** Single checkout page at `/checkout` with customer info form + payment selection + order summary sidebar. Buy Now uses CartContext `buyNowItem` state to carry a single product. Order data is in-memory (transient). Success page at `/checkout/success` reads order payload from context state.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (OKLCH tokens), TypeScript 5.

**Verification gates:** `npx tsc --noEmit` + `npm run build` + `npx prettier --check "frontend/src/**/*.{ts,tsx}"` (run after each phase).

---

## Phase 1 — Data Flow & Context (PRD Task context-1)

### Task 1: Extend CartContext with Buy Now support

**Files:**

- Modify: `frontend/src/contexts/CartContext.tsx`

**Step 1: Define the new state shape**

Add `buyNowItem` to `CartState` and new action types. Insert after line 11 (after `CartItem` interface) and update `CartState` and `CartAction`:

```typescript
// In CartState (line 13-15), add:
interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null; // NEW
}

// In CartAction (line 17-21), add two new action types:
type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_BUY_NOW"; payload: CartItem } // NEW
  | { type: "CLEAR_BUY_NOW" }; // NEW
```

**Step 2: Add reducer cases**

In `cartReducer` function, add two new cases before `default`:

```typescript
case 'SET_BUY_NOW':
  return { ...state, buyNowItem: action.payload };
case 'CLEAR_BUY_NOW':
  return { ...state, buyNowItem: null };
```

Update the initial state in `useReducer` call (line 69):

```typescript
const [state, dispatch] = useReducer(cartReducer, { items: [], buyNowItem: null });
```

**Step 3: Add context value exports**

Update `CartContextValue` interface (line 56-64) to include:

```typescript
buyNowItem: CartItem | null;
setBuyNowItem: (item: CartItem) => void;
clearBuyNowItem: () => void;
```

Add the action functions in `CartProvider` (after `clearCart` at line 93-95):

```typescript
const setBuyNowItem = (item: CartItem) => {
  dispatch({ type: "SET_BUY_NOW", payload: item });
};

const clearBuyNowItem = () => {
  dispatch({ type: "CLEAR_BUY_NOW" });
};
```

Update the `value` useMemo (line 97-108) to include `buyNowItem`, `setBuyNowItem`, `clearBuyNowItem`.

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

## Phase 2 — Checkout Page (PRD Tasks page-1, page-2, ui-2)

### Task 2: Create checkout page with form, summary, and MoMo overlay

**Files:**

- Create: `frontend/src/app/checkout/page.tsx`

This is the largest task. It combines 3 PRD tasks because they all modify the same file.

**Step 1: Create the page file skeleton**

Create `frontend/src/app/checkout/page.tsx` with:

- `'use client'` directive
- Imports: `useCart` from CartContext, `useRouter`, `useSearchParams` from next/navigation, `useState`, `useMemo`, `useEffect`
- Import `Header` and `Footer` components
- Import icons: `ArrowRightIcon`, `TruckIcon`, `ShieldIcon`, `SparkleIcon`
- Import `productIllustrations` from ProductIllustrations

**Step 2: Define types and constants**

At the top of the file (after imports):

```typescript
interface CheckoutFormData {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
}

type PaymentMethod = "cod" | "momo";

const SHIPPING_FEE = 30000;

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}
```

**Step 3: Implement checkout items logic**

Inside the component:

```typescript
export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, buyNowItem, clearBuyNowItem } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  // Determine checkout items
  const checkoutItems = useMemo(() => {
    if (isBuyNow && buyNowItem) return [buyNowItem];
    return cartItems;
  }, [isBuyNow, buyNowItem, cartItems]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );
  const total = subtotal + SHIPPING_FEE;

  // Redirect if no items
  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);
```

**Step 4: Implement form state and validation**

```typescript
const [formData, setFormData] = useState<CheckoutFormData>({
  fullName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  notes: "",
});
const [errors, setErrors] = useState<FormErrors>({});
const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
const [showMomoOverlay, setShowMomoOverlay] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const handleChange = (field: keyof CheckoutFormData, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  if (errors[field as keyof FormErrors]) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }
};

const validate = (): boolean => {
  const newErrors: FormErrors = {};
  if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
  if (!formData.phone.trim()) {
    newErrors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^0[0-9]{9}$/.test(formData.phone.trim())) {
    newErrors.phone = "Số điện thoại không hợp lệ";
  }
  if (!formData.province.trim()) newErrors.province = "Vui lòng nhập tỉnh/thành phố";
  if (!formData.district.trim()) newErrors.district = "Vui lòng nhập quận/huyện";
  if (!formData.ward.trim()) newErrors.ward = "Vui lòng nhập phường/xã";
  if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ chi tiết";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Step 5: Implement order submission**

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) {
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.focus();
    }
    return;
  }
  setIsSubmitting(true);

  if (paymentMethod === "momo") {
    setShowMomoOverlay(true);
    setIsSubmitting(false);
    return;
  }

  // COD — go straight to success
  completeOrder("cod");
};

const completeOrder = (method: PaymentMethod) => {
  const orderId = `BB-${Date.now().toString(36).toUpperCase()}`;
  // Store order data for success page (in-memory via sessionStorage for page transition)
  const orderData = {
    orderId,
    items: checkoutItems,
    subtotal,
    shippingFee: SHIPPING_FEE,
    total,
    customerInfo: formData,
    paymentMethod: method,
    status: method === "momo" ? "Đã thanh toán" : "Chờ xác nhận",
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
  };
  sessionStorage.setItem("lastOrder", JSON.stringify(orderData));

  // Clear cart or buyNow item
  if (isBuyNow) {
    clearBuyNowItem();
  } else {
    clearCart();
  }

  router.push("/checkout/success");
};
```

**Step 6: Render the JSX layout**

Full responsive layout with:

- `<Header />` at top
- Main content: 2-column grid on desktop (lg:grid-cols-3)
  - Left (lg:col-span-2): Customer form + Payment method
  - Right (lg:col-span-1): Order summary sticky sidebar
- `<Footer />` at bottom

**Customer form fields** — each with `<label>`, `<input>`, and error display:

```tsx
<div>
  <label
    htmlFor="fullName"
    className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
  >
    Họ và tên <span className="text-pink-500">*</span>
  </label>
  <input
    id="fullName"
    type="text"
    value={formData.fullName}
    onChange={(e) => handleChange("fullName", e.target.value)}
    className={`w-full px-4 py-3 rounded-xl border-2 ${errors.fullName ? "border-[var(--destructive)]" : "border-pink-200"} bg-white text-[var(--text-primary)] focus:border-pink-400 focus:outline-none transition-colors`}
    placeholder="Nguyễn Văn A"
  />
  {errors.fullName && (
    <p className="text-sm text-[var(--destructive)] mt-1" role="alert" aria-live="polite">
      {errors.fullName}
    </p>
  )}
</div>
```

Repeat pattern for: `phone` (type="tel"), `province`, `district`, `ward`, `address`, `notes` (textarea, optional).

**Payment method selection** — radio buttons with `fieldset/legend`:

```tsx
<fieldset className="mb-6">
  <legend className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4">
    Phương thức thanh toán
  </legend>
  <div className="space-y-3">
    {/* COD option */}
    <label
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        paymentMethod === "cod"
          ? "border-pink-400 bg-pink-50"
          : "border-pink-100 hover:border-pink-200"
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="cod"
        checked={paymentMethod === "cod"}
        onChange={() => setPaymentMethod("cod")}
        className="w-5 h-5 accent-pink-500"
      />
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <TruckIcon size={20} className="text-pink-500" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Thanh toán khi nhận hàng (COD)</p>
          <p className="text-sm text-[var(--text-secondary)]">
            Thanh toán bằng tiền mặt khi nhận hàng
          </p>
        </div>
      </div>
    </label>
    {/* MoMo option — same pattern with MoMo branding */}
    <label
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
        paymentMethod === "momo"
          ? "border-pink-400 bg-pink-50"
          : "border-pink-100 hover:border-pink-200"
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="momo"
        checked={paymentMethod === "momo"}
        onChange={() => setPaymentMethod("momo")}
        className="w-5 h-5 accent-pink-500"
      />
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <span className="text-lg font-bold text-pink-500">M</span>
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Ví MoMo</p>
          <p className="text-sm text-[var(--text-secondary)]">Thanh toán qua ví điện tử MoMo</p>
        </div>
      </div>
    </label>
  </div>
</fieldset>
```

**Order summary sidebar:**

```tsx
<div className="lg:col-span-1">
  <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 sticky top-28">
    <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-5 flex items-center gap-2">
      <SparkleIcon size={20} className="text-pink-400" />
      Đơn hàng của bạn
    </h2>
    {/* Item list */}
    <div className="space-y-3 mb-5">
      {checkoutItems.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          {/* Item illustration */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {/* ProductIllustration or fallback */}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      ))}
    </div>
    {/* Totals */}
    <div className="border-t border-pink-100 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Tạm tính</span>
        <span className="text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
        <span className="text-[var(--text-primary)]">{formatPrice(SHIPPING_FEE)}</span>
      </div>
      <div className="flex justify-between text-base font-bold pt-2 border-t border-pink-100">
        <span className="text-[var(--text-primary)]">Tổng cộng</span>
        <span className="text-pink-500">{formatPrice(total)}</span>
      </div>
    </div>
    {/* Submit button */}
    <button
      type="submit"
      form="checkout-form"
      disabled={isSubmitting}
      className="w-full mt-5 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>{isSubmitting ? "Đang xử lý..." : "Đặt hàng"}</span>
      <ArrowRightIcon size={18} />
    </button>
  </div>
</div>
```

**MoMo overlay** — conditionally rendered modal:

```tsx
{
  showMomoOverlay && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-pink-500">M</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] font-heading mb-2">
          Thanh toán MoMo
        </h3>
        <p className="text-[var(--text-secondary)] mb-4">Quét mã QR để thanh toán</p>
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-2xl border-2 border-dashed border-pink-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-xs text-[var(--text-muted)]">QR Code</p>
          </div>
        </div>
        <p className="text-lg font-bold text-pink-500 mb-1">{formatPrice(total)}</p>
        <p className="text-xs text-[var(--text-muted)] mb-6 italic">
          ⚠️ Đây là mô phỏng — không phải thanh toán thật
        </p>
        <button
          onClick={() => {
            setShowMomoOverlay(false);
            completeOrder("momo");
          }}
          className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl mb-3 hover:shadow-lg transition-all"
        >
          Đã thanh toán
        </button>
        <button
          onClick={() => setShowMomoOverlay(false)}
          className="w-full py-3 text-[var(--text-secondary)] hover:text-pink-500 transition-colors"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
}
```

**Step 7: Verify Phase 2**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npm run build`
Expected: `/checkout` route appears in output

Manual checks:

- Navigate to `/checkout` → form renders with all fields
- Submit empty → validation errors appear
- Select COD/MoMo → see different payment info
- Select MoMo + submit → QR overlay appears
- Click "Đã thanh toán" → navigates to success

---

## Phase 3 — Success Page, Icons & Wiring (PRD Tasks page-3, ui-1, integration-1, integration-2)

### Task 3: Create order confirmation page

**Files:**

- Create: `frontend/src/app/checkout/success/page.tsx`

**Step 1: Create success page**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SparkleIcon, TruckIcon, ArrowRightIcon } from "@/components/icons";
import {
  productIllustrations,
  type ProductIllustrationType,
} from "@/components/icons/ProductIllustrations";

interface OrderData {
  orderId: string;
  items: Array<{ id: string; name: string; price: number; image: string; quantity: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  customerInfo: {
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    notes: string;
  };
  paymentMethod: "cod" | "momo";
  status: string;
  estimatedDelivery: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}
```

**Step 2: Implement component**

```typescript
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('lastOrder');
    if (data) {
      setOrder(JSON.parse(data));
      sessionStorage.removeItem('lastOrder');
    } else {
      router.push('/products');
    }
  }, [router]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--warm-white)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--warm-white)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Success Banner */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-heading mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Mã đơn hàng: <span className="font-semibold text-pink-500">{order.orderId}</span>
            </p>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading">
                Trạng thái đơn hàng
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'Đã thanh toán'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
            {/* Payment method and estimated delivery */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Phương thức thanh toán</p>
                <p className="font-semibold text-[var(--text-primary)]">
                  {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Ví MoMo'}
                </p>
              </div>
              <div>
                <p className="text-[var(--text-secondary)] mb-1">Dự kiến giao hàng</p>
                <p className="font-semibold text-[var(--text-primary)]">{order.estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4 flex items-center gap-2">
              <TruckIcon size={20} className="text-pink-400" />
              Thông tin giao hàng
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-[var(--text-secondary)]">Người nhận:</span> <span className="font-medium text-[var(--text-primary)]">{order.customerInfo.fullName}</span></p>
              <p><span className="text-[var(--text-secondary)]">Điện thoại:</span> <span className="font-medium text-[var(--text-primary)]">{order.customerInfo.phone}</span></p>
              <p><span className="text-[var(--text-secondary)]">Địa chỉ:</span> <span className="font-medium text-[var(--text-primary)]">
                {order.customerInfo.address}, {order.customerInfo.ward}, {order.customerInfo.district}, {order.customerInfo.province}
              </span></p>
              {order.customerInfo.notes && (
                <p><span className="text-[var(--text-secondary)]">Ghi chú:</span> <span className="font-medium text-[var(--text-primary)]">{order.customerInfo.notes}</span></p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-md border border-pink-50 p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-heading mb-4 flex items-center gap-2">
              <SparkleIcon size={20} className="text-pink-400" />
              Chi tiết đơn hàng
            </h2>
            <div className="space-y-3 mb-4">
              {order.items.map((item) => {
                const Illustration = productIllustrations[item.image as ProductIllustrationType];
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-[var(--soft-cream)] flex items-center justify-center flex-shrink-0">
                      {Illustration ? <Illustration size={32} /> : <span className="text-pink-300 text-lg">🎁</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>
            {/* Totals */}
            <div className="border-t border-pink-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Phí vận chuyển</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-pink-100">
                <span>Tổng cộng</span>
                <span className="text-pink-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
            >
              <span>Tiếp tục mua sắm</span>
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: `/checkout/success` route in output

---

### Task 4: Add payment-related icons

**Files:**

- Modify: `frontend/src/components/icons/index.tsx`

**Step 1: Add new icon components at end of file**

Append before the final closing (after last icon export):

```typescript
// Check Circle Icon
export const CheckCircleIcon = ({ className = '', size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Map Pin Icon
export const MapPinIcon = ({ className = '', size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

// COD Icon (Cash/Wallet)
export const CodIcon = ({ className = '', size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="15" r="2" fill="currentColor" />
  </svg>
);

// MoMo Icon (stylized M in circle)
export const MomoIcon = ({ className = '', size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#d63384" />
    <path d="M7 16V8l2.5 5L12 8l2.5 5L17 8v8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 5: Wire cart "Thanh toán" button to /checkout

**Files:**

- Modify: `frontend/src/app/cart/page.tsx`

**Step 1: Add useRouter import**

Add `useRouter` import from `next/navigation` at the top of the file.

**Step 2: Initialize router**

Inside `CartPage` component, add:

```typescript
const router = useRouter();
```

**Step 3: Replace alert with navigation**

Change line 204 from:

```typescript
onClick={() => alert('Chức năng thanh toán sẽ sớm được cập nhật!')}
```

To:

```typescript
onClick={() => router.push('/checkout')}
```

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

### Task 6: Wire "Mua ngay" buttons to checkout

**Files:**

- Modify: `frontend/src/app/products/[id]/page.tsx`
- Modify: `frontend/src/components/ProductDetailModal.tsx`

**Step 1: Update product detail page**

In `frontend/src/app/products/[id]/page.tsx`:

- Add `useRouter` import from `next/navigation`
- Add `useCart` destructuring to include `setBuyNowItem`
- Initialize `const router = useRouter()`
- Replace the empty "Mua ngay" button (line 620) with:

```tsx
<button
  onClick={() => {
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.illustration,
      quantity,
    });
    router.push("/checkout?buyNow=true");
  }}
  className="py-4 px-8 border-2 border-pink-400 text-pink-500 font-semibold rounded-2xl hover:bg-pink-50 transition-all"
>
  Mua ngay
</button>
```

**Step 2: Update ProductDetailModal**

In `frontend/src/components/ProductDetailModal.tsx`:

- Add `useRouter` import from `next/navigation`
- Add `useCart` destructuring to include `setBuyNowItem`
- Initialize `const router = useRouter()`
- Replace the empty "Mua ngay" button (line 382) with:

```tsx
<button
  onClick={() => {
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.illustration,
      quantity,
    });
    router.push("/checkout?buyNow=true");
  }}
  className="w-full py-3 px-6 border-2 border-pink-400 text-pink-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-pink-50 transition-all mb-5"
>
  <span>Mua ngay</span>
  <ArrowRightIcon size={18} />
</button>
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

---

## Final Verification (All Phases)

Run these commands after all tasks are complete:

```bash
# TypeScript
npx tsc --noEmit
# Expected: 0 errors

# Build
npm run build
# Expected: /checkout and /checkout/success routes in output

# Prettier
npx prettier --check "src/**/*.{ts,tsx}"
# Expected: All files formatted

# Manual checks:
# 1. /cart → click "Thanh toán" → /checkout with all cart items
# 2. /products/1 → click "Mua ngay" → /checkout with single item
# 3. /checkout → empty submit → validation errors
# 4. /checkout → fill form → COD → "Đặt hàng" → /checkout/success with "Chờ xác nhận"
# 5. /checkout → fill form → MoMo → "Đặt hàng" → QR overlay → "Đã thanh toán" → /checkout/success with "Đã thanh toán"
# 6. After cart checkout → cart is empty
# 7. After buy-now checkout → cart items unchanged
```

---

## Task-to-PRD Mapping

| Plan Task | PRD Task ID        | PRD Title                               |
| --------- | ------------------ | --------------------------------------- |
| Task 1    | context-1          | Extend CartContext with Buy Now support |
| Task 2    | page-1+page-2+ui-2 | Checkout page + summary + MoMo overlay  |
| Task 3    | page-3             | Order confirmation page                 |
| Task 4    | ui-1               | Payment-related icons                   |
| Task 5    | integration-1      | Wire cart "Thanh toán" to /checkout     |
| Task 6    | integration-2      | Wire "Mua ngay" to checkout             |

---

## Notes

- **React 19**: `<Context value={}>` — no `.Provider`
- **Vietnamese UI**: All labels in Vietnamese
- **sessionStorage**: Used only for order data between checkout → success page transition
- **Order ID format**: `BB-{base36 timestamp}` (e.g., `BB-LK3F9X2`)
- **No backend**: All client-side simulation
- **Cart behavior**: Cart checkout → `clearCart()`. Buy Now → `clearBuyNowItem()` only.
