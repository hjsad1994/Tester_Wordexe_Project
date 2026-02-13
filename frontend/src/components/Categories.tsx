'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  type Category as ApiCategory,
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '@/lib/api';
import { SparkleIcon } from './icons';
import {
  BottleIllustration,
  ClothesIllustration,
  DiaperIllustration,
  PacifierIllustration,
  StrollerIllustration,
  TeddyIllustration,
} from './icons/ProductIllustrations';

const categories = [
  {
    id: '1',
    name: 'Quần áo',
    Icon: ClothesIllustration,
    count: 256,
    color: 'from-pink-100 to-pink-200',
    hoverColor: 'group-hover:from-pink-200 group-hover:to-pink-300',
  },
  {
    id: '2',
    name: 'Bình sữa',
    Icon: BottleIllustration,
    count: 128,
    color: 'from-blue-100 to-blue-200',
    hoverColor: 'group-hover:from-blue-200 group-hover:to-blue-300',
  },
  {
    id: '3',
    name: 'Đồ chơi',
    Icon: TeddyIllustration,
    count: 342,
    color: 'from-amber-100 to-amber-200',
    hoverColor: 'group-hover:from-amber-200 group-hover:to-amber-300',
  },
  {
    id: '4',
    name: 'Xe đẩy',
    Icon: StrollerIllustration,
    count: 89,
    color: 'from-purple-100 to-purple-200',
    hoverColor: 'group-hover:from-purple-200 group-hover:to-purple-300',
  },
  {
    id: '5',
    name: 'Tã & Bỉm',
    Icon: DiaperIllustration,
    count: 167,
    color: 'from-cyan-100 to-cyan-200',
    hoverColor: 'group-hover:from-cyan-200 group-hover:to-cyan-300',
  },
  {
    id: '6',
    name: 'Ti giả',
    Icon: PacifierIllustration,
    count: 94,
    color: 'from-rose-100 to-rose-200',
    hoverColor: 'group-hover:from-rose-200 group-hover:to-rose-300',
  },
];

export default function Categories() {
  const { isAdmin } = useAuth();
  const [adminCategories, setAdminCategories] = useState<ApiCategory[]>([]);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    const loadCategories = async () => {
      setAdminLoading(true);
      setAdminError(null);

      try {
        const data = await fetchCategories();
        setAdminCategories(data);
      } catch (error) {
        setAdminError(error instanceof Error ? error.message : 'Không thể tải danh mục quản trị');
      } finally {
        setAdminLoading(false);
      }
    };

    void loadCategories();
  }, [isAdmin]);

  const resetForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '' });
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.name.trim()) {
      setAdminError('Tên danh mục là bắt buộc');
      return;
    }

    try {
      setAdminError(null);

      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
        setAdminCategories((prev) =>
          prev.map((category) => (category._id === updated._id ? updated : category))
        );
      } else {
        const created = await createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
        });
        setAdminCategories((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể lưu danh mục');
    }
  };

  const handleEditCategory = (category: ApiCategory) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setAdminError(null);
      await deleteCategory(categoryId);
      setAdminCategories((prev) => prev.filter((category) => category._id !== categoryId));
      if (editingCategoryId === categoryId) {
        resetForm();
      }
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể xóa danh mục');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--warm-white)] to-pink-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-medium text-sm mb-4 animate-bounce-soft">
            <SparkleIcon size={16} />
            Khám phá
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Tìm kiếm sản phẩm phù hợp cho bé yêu theo từng danh mục
          </p>
          {isAdmin && (
            <button className="mt-4 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-400 to-pink-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all">
              + Thêm danh mục
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mb-10 rounded-3xl border border-pink-200 bg-white p-5 sm:p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Quản trị danh mục</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">
              Tạo, chỉnh sửa và xóa danh mục sản phẩm ngay trên trang này.
            </p>

            {adminError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
                {adminError}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 mb-3">
              <input
                type="text"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Tên danh mục"
                className="px-3 py-2.5 rounded-xl border border-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 text-sm"
              />
              <input
                type="text"
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Mô tả danh mục"
                className="px-3 py-2.5 rounded-xl border border-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => void handleCategorySubmit()}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors"
              >
                {editingCategoryId ? 'Cập nhật danh mục' : 'Tạo danh mục'}
              </button>
              {editingCategoryId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-pink-300 text-pink-600 text-sm font-medium hover:bg-pink-50 transition-colors"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[var(--text-muted)] border-b border-pink-100">
                    <th className="py-2 pr-2">Tên danh mục</th>
                    <th className="py-2 pr-2">Slug</th>
                    <th className="py-2 pr-2">Trạng thái</th>
                    <th className="py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {adminLoading ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-[var(--text-muted)]">
                        Đang tải danh mục quản trị...
                      </td>
                    </tr>
                  ) : (
                    adminCategories.map((category) => (
                      <tr key={category._id} className="border-b border-pink-50">
                        <td className="py-3 pr-2 font-medium text-[var(--text-primary)]">
                          {category.name}
                        </td>
                        <td className="py-3 pr-2 text-[var(--text-muted)]">{category.slug}</td>
                        <td className="py-3 pr-2">{category.isActive ? 'Hiển thị' : 'Ẩn'}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="px-3 py-1.5 rounded-lg border border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => void handleDeleteCategory(category._id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.Icon;
            return (
              <button
                key={category.id}
                className="group animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="relative p-6 sm:p-8 rounded-3xl bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} ${category.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  {/* Icon */}
                  <div className="relative z-10 flex justify-center mb-4">
                    <div
                      className={`transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <IconComponent size={70} />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="relative z-10 font-semibold text-[var(--text-primary)] text-lg mb-1 transition-colors duration-300">
                    {category.name}
                  </h3>

                  {/* Count */}
                  <p className="relative z-10 text-sm text-[var(--text-muted)] transition-colors duration-300">
                    {category.count} sản phẩm
                  </p>

                  {/* Hover Ring */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-300/50 rounded-3xl transition-all duration-500"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Promo Banner */}
        <div className="mt-16 relative">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-1">
            <div className="relative rounded-[22px] bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 p-8 sm:p-12 overflow-hidden">
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white font-medium text-sm mb-4">
                    Ưu đãi đặc biệt
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                    Giảm đến 50% cho bé yêu
                  </h3>
                  <p className="text-white/80 max-w-lg">
                    Đăng ký thành viên ngay để nhận ưu đãi độc quyền và cập nhật những sản phẩm mới
                    nhất
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="px-6 py-4 rounded-full w-full sm:w-72 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border-2 border-white/30 focus:border-white focus:outline-none transition-all duration-300"
                  />
                  <button className="px-8 py-4 rounded-full bg-white text-pink-500 font-semibold hover:bg-pink-50 transition-all duration-300 hover:shadow-lg whitespace-nowrap">
                    Đăng ký ngay
                  </button>
                </div>
              </div>

              {/* Floating Elements - SVG based */}
              <div className="absolute top-4 left-4 animate-float opacity-30">
                <TeddyIllustration size={50} />
              </div>
              <div className="absolute bottom-4 right-4 animate-float-reverse opacity-30">
                <PacifierIllustration size={45} />
              </div>
              <div className="absolute top-1/2 right-1/4 animate-bounce-soft opacity-20">
                <SparkleIcon size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
