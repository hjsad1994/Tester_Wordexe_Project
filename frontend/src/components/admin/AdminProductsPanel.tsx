'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  fetchCategories as fetchCategoriesApi,
  fetchProducts as fetchProductsApi,
  updateProduct as updateProductApi,
} from '@/lib/api';

export default function AdminProductsPanel() {
  const [adminProducts, setAdminProducts] = useState<ApiProduct[]>([]);
  const [adminCategories, setAdminCategories] = useState<ApiCategory[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);

    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProductsApi({ page: 1, limit: 50, sort: '-createdAt' }),
        fetchCategoriesApi(),
      ]);

      setAdminProducts(productsData.products);
      setAdminCategories(categoriesData);
      setProductForm((prev) => ({
        ...prev,
        category: prev.category || categoriesData[0]?._id || '',
      }));
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể tải dữ liệu quản trị');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      price: '',
      category: adminCategories[0]?._id || '',
      description: '',
    });
  };

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      setAdminError('Vui lòng nhập đầy đủ tên, giá và danh mục sản phẩm');
      return;
    }

    try {
      setAdminError(null);

      const payload = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        category: productForm.category,
        description: productForm.description.trim() || undefined,
      };

      if (editingProductId) {
        const updated = await updateProductApi(editingProductId, payload);
        setAdminProducts((prev) =>
          prev.map((product) => (product._id === updated._id ? updated : product))
        );
      } else {
        const created = await createProductApi(payload);
        setAdminProducts((prev) => [created, ...prev]);
      }

      resetProductForm();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể lưu sản phẩm');
    }
  };

  const handleEditProduct = (product: ApiProduct) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      price: String(product.price),
      category: typeof product.category === 'string' ? product.category : product.category._id,
      description: product.description || '',
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setAdminError(null);
      await deleteProductApi(productId);
      setAdminProducts((prev) => prev.filter((product) => product._id !== productId));
      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Bảng quản trị sản phẩm</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            CRUD sản phẩm dành riêng cho tài khoản admin
          </p>
        </div>
        <button
          onClick={loadAdminData}
          className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
        >
          Làm mới dữ liệu
        </button>
      </div>

      {adminError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {adminError}
        </div>
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          value={productForm.name}
          onChange={(event) =>
            setProductForm((prev) => ({
              ...prev,
              name: event.target.value,
            }))
          }
          placeholder="Tên sản phẩm"
          className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        />
        <input
          type="number"
          min={0}
          value={productForm.price}
          onChange={(event) =>
            setProductForm((prev) => ({
              ...prev,
              price: event.target.value,
            }))
          }
          placeholder="Giá bán"
          className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        />
        <select
          value={productForm.category}
          onChange={(event) =>
            setProductForm((prev) => ({
              ...prev,
              category: event.target.value,
            }))
          }
          className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <option value="">Chọn danh mục</option>
          {adminCategories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={productForm.description}
          onChange={(event) =>
            setProductForm((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          placeholder="Mô tả ngắn"
          className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={handleProductSubmit}
          className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
        >
          {editingProductId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </button>
        {editingProductId && (
          <button
            onClick={resetProductForm}
            className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
          >
            Hủy chỉnh sửa
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-left text-[var(--text-muted)]">
              <th className="py-2 pr-2">Tên</th>
              <th className="py-2 pr-2">Giá</th>
              <th className="py-2 pr-2">Danh mục</th>
              <th className="py-2 pr-2">Trạng thái</th>
              <th className="py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={5}>
                  Đang tải dữ liệu quản trị...
                </td>
              </tr>
            ) : (
              adminProducts.map((product) => {
                const categoryName =
                  typeof product.category === 'string'
                    ? adminCategories.find((category) => category._id === product.category)?.name ||
                      'Không xác định'
                    : product.category.name;

                return (
                  <tr key={product._id} className="align-top border-b border-pink-50">
                    <td className="py-3 pr-2 font-medium text-[var(--text-primary)]">
                      {product.name}
                    </td>
                    <td className="py-3 pr-2">{Number(product.price).toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 pr-2">{categoryName}</td>
                    <td className="py-3 pr-2">{product.isActive ? 'Hiển thị' : 'Ẩn'}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => void handleDeleteProduct(product._id)}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
