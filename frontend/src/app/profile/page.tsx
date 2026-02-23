'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import {
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PackageIcon,
  UserIcon,
} from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  changePassword,
  fetchMyOrders,
  fetchMyProfile,
  type Order,
  type OrderStatus,
  type UserProfile,
  updateMyProfile,
  uploadAvatar,
} from '@/lib/api';

type Tab = 'profile' | 'password' | 'orders';

const tabs: { key: Tab; label: string; icon: typeof EditIcon }[] = [
  { key: 'profile', label: 'Thông tin cá nhân', icon: EditIcon },
  { key: 'password', label: 'Đổi mật khẩu', icon: LockIcon },
  { key: 'orders', label: 'Lịch sử đơn hàng', icon: PackageIcon },
];

interface ProfileFormState {
  name: string;
  phone: string;
  address: string;
  bio: string;
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  phone: '',
  address: '',
  bio: '',
};

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

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  shipped: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

const toProfileForm = (user: UserProfile): ProfileFormState => ({
  name: user.name || '',
  phone: user.phone || '',
  address: user.address || '',
  bio: user.bio || '',
});

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, syncUser } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileRequestError, setProfileRequestError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      setIsProfileLoading(true);
      setProfileRequestError(null);

      try {
        const profile = await fetchMyProfile();
        if (!cancelled) {
          setUser(profile);
          setProfileForm(toProfileForm(profile));
          syncUser(profile);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Không thể tải thông tin tài khoản';
          setProfileRequestError(message);
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isAuthenticated, router, syncUser]);

  useEffect(() => {
    if (activeTab !== 'orders' || !isAuthenticated || isAuthLoading) return;

    let cancelled = false;

    const loadOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError(null);

      try {
        const data = await fetchMyOrders({ limit: 20 });
        if (!cancelled) {
          setOrders(data.orders);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng';
          setOrdersError(message);
        }
      } finally {
        if (!cancelled) {
          setIsOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [activeTab, isAuthenticated, isAuthLoading]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      return;
    }

    setAvatarError(null);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Ảnh không được vượt quá 5MB');
      e.target.value = '';
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
    e.target.value = '';
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      const updatedUser = await uploadAvatar(avatarFile);
      setUser(updatedUser);
      setProfileForm(toProfileForm(updatedUser));
      syncUser(updatedUser);
      showToast('Đã cập nhật ảnh đại diện');
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh đại diện';
      setAvatarError(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarCancel = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
  };

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Vui lòng nhập họ tên';
    }

    if (!profileForm.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)\d{9,10}$/.test(profileForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (profileForm.bio.length > 300) {
      errors.bio = 'Giới thiệu không được vượt quá 300 ký tự';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);
    setProfileErrors((prev) => ({ ...prev, submit: '' }));

    try {
      const updatedUser = await updateMyProfile(profileForm);
      setUser(updatedUser);
      setProfileForm(toProfileForm(updatedUser));
      syncUser(updatedUser);
      showToast('Cập nhật thành công');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ';
      setProfileErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePasswordForm = () => {
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

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordErrors({});

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      showToast('Đổi mật khẩu thành công');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đổi mật khẩu';
      setPasswordErrors({ submit: message });
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (isAuthLoading || isProfileLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <p className="text-[var(--text-secondary)]">Đang tải thông tin tài khoản...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <p className="text-[var(--text-secondary)]">Đang chuyển hướng tới trang đăng nhập...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700 font-medium">
              {profileRequestError || 'Không thể tải thông tin tài khoản'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary text-sm"
            >
              Thử lại
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <div className="gradient-pink py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-pink-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Xem trước ảnh đại diện"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : user.avatar ? (
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
                  disabled={isUploadingAvatar}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors border border-pink-200 group-hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
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

              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-display">
                  {user.name}
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">{user.email}</p>
                {avatarPreview && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? 'Đang tải lên...' : 'Cập nhật ảnh đại diện'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAvatarCancel}
                      disabled={isUploadingAvatar}
                      className="px-4 py-2 text-sm rounded-xl border-2 border-pink-200 text-[var(--text-secondary)] hover:bg-pink-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                {isUploadingAvatar && !avatarPreview && (
                  <p className="text-[var(--text-muted)] text-sm mt-2">Đang tải ảnh lên...</p>
                )}
                {avatarError && (
                  <p className="text-red-500 text-sm mt-2 animate-fade-in-up">{avatarError}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {profileRequestError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {profileRequestError}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
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

            <div className="flex-1 min-w-0">
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-6">
                    Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-5">
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
                          setProfileForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                          if (profileErrors.name) {
                            setProfileErrors((prev) => ({ ...prev, name: '' }));
                          }
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

                    <div>
                      <label
                        htmlFor="profile-phone"
                        className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                      >
                        Số điện thoại <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => {
                          setProfileForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                          if (profileErrors.phone) {
                            setProfileErrors((prev) => ({
                              ...prev,
                              phone: '',
                            }));
                          }
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
                          setProfileForm((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 bg-white transition-colors focus:outline-none"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

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
                        onChange={(e) => {
                          setProfileForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }));
                          if (profileErrors.bio) {
                            setProfileErrors((prev) => ({ ...prev, bio: '' }));
                          }
                        }}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 bg-white transition-colors focus:outline-none resize-none"
                        placeholder="Viết vài dòng về bạn..."
                      />
                      {profileErrors.bio && (
                        <p className="text-red-500 text-sm mt-1">{profileErrors.bio}</p>
                      )}
                    </div>

                    {profileErrors.submit && (
                      <p className="text-red-500 text-sm">{profileErrors.submit}</p>
                    )}

                    <button
                      type="submit"
                      className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-6">
                    Đổi mật khẩu
                  </h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
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
                            if (passwordErrors.currentPassword) {
                              setPasswordErrors((prev) => ({
                                ...prev,
                                currentPassword: '',
                              }));
                            }
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
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }));
                            if (passwordErrors.newPassword) {
                              setPasswordErrors((prev) => ({
                                ...prev,
                                newPassword: '',
                              }));
                            }
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
                            if (passwordErrors.confirmPassword) {
                              setPasswordErrors((prev) => ({
                                ...prev,
                                confirmPassword: '',
                              }));
                            }
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

                    {passwordErrors.submit && (
                      <p className="text-red-500 text-sm animate-fade-in-up">
                        {passwordErrors.submit}
                      </p>
                    )}

                    <button type="submit" className="btn-primary text-sm">
                      Đổi mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4 animate-fade-in-up">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-4">
                    Lịch sử đơn hàng
                  </h2>

                  {isOrdersLoading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-12 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4" />
                      <p className="text-[var(--text-muted)]">Đang tải đơn hàng...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
                      <p className="text-red-500 font-semibold">{ordersError}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="mt-3 text-sm text-pink-600 hover:text-pink-700 underline"
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
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
                    orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden transition-shadow hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrder(expandedOrder === order._id ? null : order._id)
                          }
                          className="w-full flex items-center justify-between p-5 text-left"
                          aria-expanded={expandedOrder === order._id}
                          aria-controls={`order-details-${order._id}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                            <span className="font-bold text-[var(--text-primary)]">
                              #{order.orderNumber}
                            </span>
                            <span className="text-sm text-[var(--text-muted)]">
                              {formatDate(order.createdAt)}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-pink-600 hidden sm:inline">
                              {formatPrice(order.total)}
                            </span>
                            {expandedOrder === order._id ? (
                              <ChevronUpIcon size={20} className="text-[var(--text-muted)]" />
                            ) : (
                              <ChevronDownIcon size={20} className="text-[var(--text-muted)]" />
                            )}
                          </div>
                        </button>

                        {expandedOrder === order._id && (
                          <div
                            id={`order-details-${order._id}`}
                            className="border-t border-pink-100 p-5 bg-pink-50/30"
                          >
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.productName}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                        <PackageIcon size={20} className="text-pink-400" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium text-[var(--text-primary)]">
                                        {item.productName}
                                      </p>
                                      <p className="text-sm text-[var(--text-muted)]">
                                        x{item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-[var(--text-primary)]">
                                    {formatPrice(item.productPrice * item.quantity)}
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

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
