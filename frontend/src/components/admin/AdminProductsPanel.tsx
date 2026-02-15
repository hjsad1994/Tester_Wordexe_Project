'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  fetchCategories as fetchCategoriesApi,
  fetchProducts as fetchProductsApi,
  updateProduct as updateProductApi,
  uploadProductImage as uploadProductImageApi,
} from '@/lib/api';

type ProductFormState = {
  name: string;
  price: string;
  quantity: string;
  category: string;
  description: string;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const createEmptyProductForm = (categoryId = ''): ProductFormState => ({
  name: '',
  price: '',
  quantity: '0',
  category: categoryId,
  description: '',
});

export default function AdminProductsPanel() {
  const [adminProducts, setAdminProducts] = useState<ApiProduct[]>([]);
  const [adminCategories, setAdminCategories] = useState<ApiCategory[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ApiProduct | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm());
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const productModalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const productNameInputRef = useRef<HTMLInputElement | null>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const editingProduct = useMemo(
    () => adminProducts.find((product) => product._id === editingProductId) ?? null,
    [adminProducts, editingProductId]
  );

  const editingProductImage = editingProduct?.images?.[0] || null;
  const previewImageUrl =
    selectedImagePreviewUrl || (removeExistingImage ? null : editingProductImage);

  const clearSelectedImage = useCallback(() => {
    setSelectedImageFile(null);
    setImageUploadError(null);
    setSelectedImagePreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const trapFocus = useCallback((event: KeyboardEvent, container: HTMLElement | null) => {
    if (event.key !== 'Tab' || !container) {
      return false;
    }

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(
      (element) =>
        !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
    );

    if (focusableElements.length === 0) {
      return false;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (!activeElement || !container.contains(activeElement)) {
      firstElement.focus();
      event.preventDefault();
      return true;
    }

    if (event.shiftKey && activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
      return true;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
      return true;
    }

    return false;
  }, []);

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
        category: prev.category || categoriesData[0]?._id || prev.category,
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

  useEffect(
    () => () => {
      setSelectedImagePreviewUrl((prev) => {
        if (prev?.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    },
    []
  );

  const resetProductForm = useCallback(() => {
    setEditingProductId(null);
    setProductForm(createEmptyProductForm(adminCategories[0]?._id || ''));
    setRemoveExistingImage(false);
    clearSelectedImage();
  }, [adminCategories, clearSelectedImage]);

  const closeProductModal = useCallback(() => {
    if (isSubmittingProduct) {
      return;
    }

    setProductModalOpen(false);
    resetProductForm();
  }, [isSubmittingProduct, resetProductForm]);

  const openCreateModal = () => {
    setAdminError(null);
    setProductModalOpen(true);
    resetProductForm();
  };

  useEffect(() => {
    if (!productModalOpen) {
      return;
    }

    queueMicrotask(() => {
      productNameInputRef.current?.focus();
    });
  }, [productModalOpen]);

  useEffect(() => {
    if (!deletingProduct) {
      return;
    }

    queueMicrotask(() => {
      deleteCancelButtonRef.current?.focus();
    });
  }, [deletingProduct]);

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productForm.name.trim() || productForm.price.trim() === '' || !productForm.category) {
      setAdminError('Vui lòng nhập đầy đủ tên, giá và danh mục sản phẩm');
      return;
    }

    const parsedPrice = Number(productForm.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setAdminError('Giá sản phẩm phải là số không âm');
      return;
    }

    const quantityInput = productForm.quantity.trim();
    const parsedQuantity = quantityInput === '' ? 0 : Number(quantityInput);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setAdminError('Tồn kho phải là số nguyên không âm');
      return;
    }

    try {
      setIsSubmittingProduct(true);
      setAdminError(null);

      const payload: {
        name: string;
        price: number;
        quantity: number;
        category: string;
        description?: string;
        images?: string[];
      } = {
        name: productForm.name.trim(),
        price: parsedPrice,
        quantity: parsedQuantity,
        category: productForm.category,
        description: productForm.description.trim() || undefined,
      };

      if (removeExistingImage && !selectedImageFile) {
        payload.images = [];
      }

      if (editingProductId) {
        let updated = await updateProductApi(editingProductId, payload);
        if (selectedImageFile) {
          const uploaded = await uploadProductImageApi(editingProductId, selectedImageFile);

          if (removeExistingImage) {
            const newestImage = uploaded.images?.[uploaded.images.length - 1];
            updated = newestImage
              ? await updateProductApi(editingProductId, {
                  images: [newestImage],
                })
              : uploaded;
          } else {
            updated = uploaded;
          }
        }

        setAdminProducts((prev) =>
          prev.map((product) => (product._id === updated._id ? updated : product))
        );
      } else {
        let created = await createProductApi(payload);
        if (selectedImageFile) {
          created = await uploadProductImageApi(created._id, selectedImageFile);
        }

        setAdminProducts((prev) => [created, ...prev]);
      }

      setProductModalOpen(false);
      resetProductForm();
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể lưu sản phẩm');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleEditProduct = (product: ApiProduct) => {
    setAdminError(null);
    setProductModalOpen(true);
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      price: String(product.price),
      quantity: String(product.quantity ?? 0),
      category: typeof product.category === 'string' ? product.category : product.category._id,
      description: product.description || '',
    });
    setRemoveExistingImage(false);
    clearSelectedImage();
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct || isDeletingProduct) {
      return;
    }

    try {
      setIsDeletingProduct(true);
      setAdminError(null);
      await deleteProductApi(deletingProduct._id);
      setAdminProducts((prev) => prev.filter((product) => product._id !== deletingProduct._id));

      if (editingProductId === deletingProduct._id) {
        setProductModalOpen(false);
        resetProductForm();
      }

      setDeletingProduct(null);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Không thể xóa sản phẩm');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageUploadError('Chỉ hỗ trợ JPEG, PNG, WebP hoặc GIF');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageUploadError('Dung lượng ảnh phải nhỏ hơn hoặc bằng 5MB');
      event.target.value = '';
      return;
    }

    clearSelectedImage();
    setSelectedImageFile(file);
    setImageUploadError(null);
    setSelectedImagePreviewUrl(URL.createObjectURL(file));

    if (editingProductImage) {
      setRemoveExistingImage(true);
    }
  };

  const handleRemoveImage = () => {
    clearSelectedImage();
    setRemoveExistingImage(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (deletingProduct && trapFocus(event, deleteModalRef.current)) {
          return;
        }

        if (productModalOpen && trapFocus(event, productModalRef.current)) {
          return;
        }
      }

      if (event.key !== 'Escape') {
        return;
      }

      if (deletingProduct && !isDeletingProduct) {
        setDeletingProduct(null);
        return;
      }

      if (productModalOpen && !isSubmittingProduct) {
        closeProductModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [
    closeProductModal,
    deletingProduct,
    isDeletingProduct,
    isSubmittingProduct,
    productModalOpen,
    trapFocus,
  ]);

  const getCategoryName = (product: ApiProduct) => {
    if (typeof product.category !== 'string') {
      return product.category.name;
    }

    return (
      adminCategories.find((category) => category._id === product.category)?.name ||
      'Không xác định'
    );
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadAdminData}
            className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
          >
            Làm mới dữ liệu
          </button>
          <button
            onClick={openCreateModal}
            className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
          >
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {adminError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {adminError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 text-left text-[var(--text-muted)]">
              <th className="py-2 pr-2">Ảnh</th>
              <th className="py-2 pr-2">Tên</th>
              <th className="py-2 pr-2">Giá</th>
              <th className="py-2 pr-2">Tồn kho</th>
              <th className="py-2 pr-2">Danh mục</th>
              <th className="py-2 pr-2">Trạng thái</th>
              <th className="py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={7}>
                  Đang tải dữ liệu quản trị...
                </td>
              </tr>
            ) : (
              adminProducts.map((product) => (
                <tr key={product._id} className="align-top border-b border-pink-50">
                  <td className="py-3 pr-2">
                    {product.images?.[0] ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-pink-100">
                        <Image
                          src={product.images[0]}
                          alt={`Ảnh sản phẩm ${product.name}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-pink-200 text-xs text-pink-400">
                        Chưa có
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-2 font-medium text-[var(--text-primary)]">
                    {product.name}
                  </td>
                  <td className="py-3 pr-2">{Number(product.price).toLocaleString('vi-VN')}đ</td>
                  <td className="py-3 pr-2">
                    {product.quantity > 0 ? `${product.quantity} sản phẩm` : 'Hết hàng'}
                  </td>
                  <td className="py-3 pr-2">{getCategoryName(product)}</td>
                  <td className="py-3 pr-2">{product.isActive ? 'Hiển thị' : 'Ẩn'}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="min-h-[36px] rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          setAdminError(null);
                          setDeletingProduct(product);
                        }}
                        className="min-h-[36px] rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
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

      {productModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            aria-label="Đóng modal"
            onClick={closeProductModal}
            className="absolute inset-0 bg-slate-900/45"
          />

          <div
            ref={productModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative z-10 w-full max-w-3xl overflow-y-auto rounded-3xl border border-pink-200 bg-white p-5 shadow-2xl sm:max-h-[90vh] sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3
                  id="product-modal-title"
                  className="text-lg font-bold text-[var(--text-primary)]"
                >
                  {editingProductId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Cập nhật thông tin sản phẩm và ảnh hiển thị ngay trong một modal.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                className="min-h-[36px] rounded-lg border border-pink-200 px-3 py-1 text-pink-500 transition-colors hover:bg-pink-50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Tên sản phẩm
                  <input
                    ref={productNameInputRef}
                    type="text"
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: Gấu bông thỏ kem"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Giá bán
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
                    placeholder="120000"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Tồn kho
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={productForm.quantity}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Danh mục
                  <select
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  >
                    <option value="">Chọn danh mục</option>
                    {adminCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Mô tả ngắn
                  <textarea
                    value={productForm.description}
                    onChange={(event) =>
                      setProductForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Mô tả ngắn gọn về sản phẩm"
                    className="w-full resize-none rounded-xl border border-pink-200 px-3 py-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">Ảnh sản phẩm</h4>
                  {(previewImageUrl || selectedImageFile || editingProductImage) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="min-h-[32px] rounded-lg border border-rose-300 px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Gỡ ảnh
                    </button>
                  )}
                </div>

                <label className="mb-3 flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-pink-300 bg-white px-3 py-2 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50">
                  Chọn ảnh (JPEG/PNG/WebP/GIF, tối đa 5MB)
                  <input
                    ref={imageInputRef}
                    data-testid="product-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>

                {imageUploadError && (
                  <p className="mb-2 text-sm text-rose-600">{imageUploadError}</p>
                )}

                {previewImageUrl ? (
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-pink-200 bg-white">
                    <Image
                      src={previewImageUrl}
                      alt="Ảnh xem trước"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    Chưa chọn ảnh mới. Bạn có thể thay ảnh hiện tại hoặc giữ nguyên khi lưu.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
                  disabled={isSubmittingProduct}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingProduct
                    ? 'Đang lưu...'
                    : editingProductId
                      ? 'Lưu thay đổi'
                      : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Đóng modal xác nhận xóa"
            onClick={() => {
              if (!isDeletingProduct) {
                setDeletingProduct(null);
              }
            }}
            className="absolute inset-0 bg-slate-900/45"
          />

          <div
            ref={deleteModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="relative z-10 w-full max-w-md rounded-3xl border border-rose-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <h3 id="delete-modal-title" className="text-lg font-bold text-[var(--text-primary)]">
              Xác nhận xóa sản phẩm
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Bạn sắp xóa sản phẩm{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {deletingProduct.name}
              </span>
              . Hành động này không thể hoàn tác.
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                ref={deleteCancelButtonRef}
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeletingProduct}
                className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteProduct()}
                disabled={isDeletingProduct}
                className="min-h-[44px] rounded-xl border border-rose-400 bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingProduct ? 'Đang xóa...' : 'Xóa sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
