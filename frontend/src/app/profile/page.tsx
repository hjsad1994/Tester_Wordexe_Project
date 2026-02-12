'use client';

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  UserIcon,
  CameraIcon,
  EditIcon,
  LockIcon,
  PackageIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
} from '@/components/icons';

// ─── Mock Data ───────────────────────────────────────────────

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  avatar: string | null;
}

const initialUser: UserProfile = {
  name: 'Nguyễn Thị Bảo Ngọc',
  email: 'baongoc@example.com',
  phone: '0901234567',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  bio: 'Mẹ bỉm sữa yêu thương con',
  avatar: null,
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'Đang xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
  total: number;
  items: OrderItem[];
}

const mockOrders: Order[] = [
  {
    id: 'DH001',
    date: '2026-02-10',
    status: 'Đang giao',
    total: 850000,
    items: [
      { name: 'Bộ quần áo sơ sinh', quantity: 2, price: 250000, image: '👶' },
      { name: 'Bình sữa chống sặc', quantity: 1, price: 350000, image: '🍼' },
    ],
  },
  {
    id: 'DH002',
    date: '2026-02-05',
    status: 'Hoàn thành',
    total: 1200000,
    items: [{ name: 'Xe đẩy em bé', quantity: 1, price: 1200000, image: '🛒' }],
  },
  {
    id: 'DH003',
    date: '2026-01-28',
    status: 'Đang xử lý',
    total: 450000,
    items: [
      { name: 'Gấu bông nhồi bông', quantity: 1, price: 200000, image: '🧸' },
      { name: 'Tã bỉm Huggies size M', quantity: 1, price: 250000, image: '👶' },
    ],
  },
];

// ─── Tab Types ───────────────────────────────────────────────

type Tab = 'profile' | 'password' | 'orders';

const tabs: { key: Tab; label: string; icon: typeof EditIcon }[] = [
  { key: 'profile', label: 'Thông tin cá nhân', icon: EditIcon },
  { key: 'password', label: 'Đổi mật khẩu', icon: LockIcon },
  { key: 'orders', label: 'Lịch sử đơn hàng', icon: PackageIcon },
];

// ─── Toast Component ─────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
      <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl shadow-lg border border-pink-200">
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-sm">
          ✓
        </span>
        <span className="text-[var(--text-primary)] font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Đóng thông báo"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────

function StatusBadge({ status }: { status: Order['status'] }) {
  const styles: Record<Order['status'], string> = {
    'Đang xử lý': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Đang giao': 'bg-blue-100 text-blue-700 border-blue-200',
    'Hoàn thành': 'bg-green-100 text-green-700 border-green-200',
    'Đã hủy': 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ─── Main Page Component ─────────────────────────────────────

export default function ProfilePage() {
  // State
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Order expand state
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // ─── Toast helper ────────────────────────────────────────
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Avatar Upload ───────────────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Ảnh không được vượt quá 5MB');
      e.target.value = '';
      return;
    }

    // Read and set avatar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setUser((prev) => ({ ...prev, avatar: event.target?.result as string }));
      showToast('Đã cập nhật ảnh đại diện');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── Profile Form ────────────────────────────────────────
  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
    }

    if (profileForm.phone && !/^(0|\+84)\d{9,10}$/.test(profileForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setUser((prev) => ({
      ...prev,
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address,
      bio: profileForm.bio,
    }));
    showToast('Cập nhật thành công');
  };

  // ─── Password Form ───────────────────────────────────────
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    showToast('Đổi mật khẩu thành công');
  };

  // ─── Format helpers ──────────────────────────────────────
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        {/* Hero Section */}
        <div className="gradient-pink py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-pink-100 flex items-center justify-center">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Ảnh đại diện"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <UserIcon size={56} className="text-pink-300" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors border border-pink-200 group-hover:scale-110"
                  aria-label="Đổi ảnh đại diện"
                >
                  <CameraIcon size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Chọn ảnh đại diện"
                />
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-display">
                  {user.name}
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">{user.email}</p>
                {avatarError && (
                  <p className="text-red-500 text-sm mt-2 animate-fade-in-up">{avatarError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 shrink-0">
              <nav className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-pink-50 text-pink-600 font-semibold border-l-4 border-pink-500'
                          : 'text-[var(--text-secondary)] hover:bg-pink-50/50 hover:text-pink-500 border-l-4 border-transparent'
                      }`}
                      aria-current={activeTab === tab.key ? 'page' : undefined}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* ─── Edit Profile Tab ─────────────────── */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-6">
                    Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="profile-name"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Họ và tên <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => {
                          setProfileForm((prev) => ({ ...prev, name: e.target.value }));
                          if (profileErrors.name)
                            setProfileErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                          profileErrors.name
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-pink-200 focus:border-pink-400'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {profileErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>
                      )}
                    </div>

                    {/* Email (readonly) */}
                    <div>
                      <label
                        htmlFor="profile-email"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-[var(--text-muted)] cursor-not-allowed"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Email không thể thay đổi
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="profile-phone"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Số điện thoại
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => {
                          setProfileForm((prev) => ({ ...prev, phone: e.target.value }));
                          if (profileErrors.phone)
                            setProfileErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                          profileErrors.phone
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-pink-200 focus:border-pink-400'
                        }`}
                        placeholder="0901234567"
                      />
                      {profileErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.phone}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label
                        htmlFor="profile-address"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Địa chỉ
                      </label>
                      <input
                        id="profile-address"
                        type="text"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 bg-white transition-colors focus:outline-none"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label
                        htmlFor="profile-bio"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Giới thiệu bản thân
                      </label>
                      <textarea
                        id="profile-bio"
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 bg-white transition-colors focus:outline-none resize-none"
                        placeholder="Viết vài dòng về bạn..."
                      />
                    </div>

                    <button type="submit" className="btn-primary text-sm">
                      Lưu thay đổi
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Change Password Tab ──────────────── */}
              {activeTab === 'password' && (
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-6">
                    Đổi mật khẩu
                  </h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                    {/* Current Password */}
                    <div>
                      <label
                        htmlFor="current-password"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          id="current-password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => {
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }));
                            if (passwordErrors.currentPassword)
                              setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
                          }}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                            passwordErrors.currentPassword
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-pink-200 focus:border-pink-400'
                          }`}
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showCurrentPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => {
                            setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                            if (passwordErrors.newPassword)
                              setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                          }}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                            passwordErrors.newPassword
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-pink-200 focus:border-pink-400'
                          }`}
                          placeholder="Tối thiểu 8 ký tự"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showNewPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => {
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }));
                            if (passwordErrors.confirmPassword)
                              setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                            passwordErrors.confirmPassword
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-pink-200 focus:border-pink-400'
                          }`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <button type="submit" className="btn-primary text-sm">
                      Đổi mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Order History Tab ────────────────── */}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-4">
                    Lịch sử đơn hàng
                  </h2>

                  {mockOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-12 text-center">
                      <PackageIcon size={48} className="text-pink-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        Bạn chưa có đơn hàng nào
                      </p>
                      <p className="text-[var(--text-muted)] mt-1">
                        Hãy khám phá sản phẩm và đặt hàng nhé!
                      </p>
                    </div>
                  ) : (
                    mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden transition-shadow hover:shadow-md"
                      >
                        {/* Order Header */}
                        <button
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order.id ? null : order.id)
                          }
                          className="w-full flex items-center justify-between p-5 text-left"
                          aria-expanded={expandedOrder === order.id}
                          aria-controls={`order-details-${order.id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                            <span className="font-bold text-[var(--text-primary)]">
                              #{order.id}
                            </span>
                            <span className="text-sm text-[var(--text-muted)]">
                              {formatDate(order.date)}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-pink-600 hidden sm:inline">
                              {formatPrice(order.total)}
                            </span>
                            {expandedOrder === order.id ? (
                              <ChevronUpIcon size={20} className="text-[var(--text-muted)]" />
                            ) : (
                              <ChevronDownIcon size={20} className="text-[var(--text-muted)]" />
                            )}
                          </div>
                        </button>

                        {/* Order Details (Expandable) */}
                        {expandedOrder === order.id && (
                          <div
                            id={`order-details-${order.id}`}
                            className="border-t border-pink-100 p-5 bg-pink-50/30"
                          >
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.image}</span>
                                    <div>
                                      <p className="font-medium text-[var(--text-primary)]">
                                        {item.name}
                                      </p>
                                      <p className="text-sm text-[var(--text-muted)]">
                                        x{item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-[var(--text-primary)]">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-pink-200 flex justify-between items-center">
                              <span className="font-semibold text-[var(--text-primary)]">
                                Tổng cộng
                              </span>
                              <span className="text-lg font-bold text-pink-600">
                                {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
