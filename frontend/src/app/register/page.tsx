'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { EyeIcon, EyeOffIcon, UserPlusIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!form.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError(null);

    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (!result.ok) {
      if (result.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      }
      setFormError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/');
  };

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) setFormError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="py-12 sm:py-20">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
              <UserPlusIcon size={28} className="text-pink-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-display">
              Đăng ký tài khoản
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Tạo tài khoản để trải nghiệm Baby Bliss tốt hơn!
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                    errors.name
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-pink-200 focus:border-pink-400'
                  }`}
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                    errors.email
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-pink-200 focus:border-pink-400'
                  }`}
                  placeholder="email@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                    errors.phone
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-pink-200 focus:border-pink-400'
                  }`}
                  placeholder="0901234567"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                      errors.password
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-pink-200 focus:border-pink-400'
                    }`}
                    placeholder="Tối thiểu 8 ký tự"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
                >
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 bg-white transition-colors focus:outline-none ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-pink-200 focus:border-pink-400'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
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
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {formError && (
                <p className="text-red-500 text-sm" role="alert">
                  {formError}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-[var(--text-secondary)] text-sm">
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="text-pink-500 font-semibold hover:text-pink-600 transition-colors"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
