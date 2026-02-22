'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  type Category as ApiCategory,
  type Product as ApiProduct,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  deleteProductImage as deleteProductImageApi,
  fetchCategories as fetchCategoriesApi,
  fetchProducts as fetchProductsApi,
  updateProduct as updateProductApi,
  uploadProductImages as uploadProductImagesApi,
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
const MAX_PRODUCT_IMAGES = 4;

const createEmptyProductForm = (categoryId = ''): ProductFormState => ({
  name: '',
  price: '',
  quantity: '0',
  category: categoryId,
  description: '',
});

type AdminProductsPanelView = 'products' | 'inventory';

export default function AdminProductsPanel({
  view = 'products',
}: {
  view?: AdminProductsPanelView;
}) {
  const isInventoryView = view === 'inventory';
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
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const productModalRef = useRef<HTMLDivElement | null>(null);
  const deleteModalRef = useRef<HTMLDivElement | null>(null);
  const productNameInputRef = useRef<HTMLInputElement | null>(null);
  const quantityInputRef = useRef<HTMLInputElement | null>(null);
  const deleteCancelButtonRef = useRef<HTMLButtonElement | null>(null);

  const editingProduct = useMemo(
    () => adminProducts.find((product) => product._id === editingProductId) ?? null,
    [adminProducts, editingProductId]
  );

  const displayedProducts = useMemo(() => {
    if (!isInventoryView) {
      return adminProducts;
    }

    return [...adminProducts].sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
  }, [adminProducts, isInventoryView]);

  const visibleExistingImages = useMemo(
    () => existingImages.filter((url) => !removedImages.includes(url)),
    [existingImages, removedImages]
  );

  const totalImageCount = visibleExistingImages.length + selectedImageFiles.length;
  const isAtMaxImages = totalImageCount >= MAX_PRODUCT_IMAGES;

  // Stable blob URL cache: create once per file, revoke when file leaves the array
  const blobUrlCacheRef = useRef<Map<File, string>>(new Map());

  const newImagePreviewUrls = useMemo(() => {
    const cache = blobUrlCacheRef.current;
    const currentFiles = new Set(selectedImageFiles);

    // Revoke URLs for files no longer in the list
    for (const [file, url] of cache) {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url);
        cache.delete(file);
      }
    }

    // Create URLs for new files
    return selectedImageFiles.map((file) => {
      let url = cache.get(file);
      if (!url) {
        url = URL.createObjectURL(file);
        cache.set(file, url);
      }
      return url;
    });
  }, [selectedImageFiles]);

  const clearSelectedImages = useCallback(() => {
    // Revoke all cached blob URLs
    const cache = blobUrlCacheRef.current;
    for (const url of cache.values()) {
      URL.revokeObjectURL(url);
    }
    cache.clear();

    setSelectedImageFiles([]);
    setImageUploadError(null);

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
      // Revoke all cached blob URLs on unmount
      const cache = blobUrlCacheRef.current;
      for (const url of cache.values()) {
        URL.revokeObjectURL(url);
      }
      cache.clear();
    },
    []
  );

  const resetProductForm = useCallback(() => {
    setEditingProductId(null);
    setProductForm(createEmptyProductForm(adminCategories[0]?._id || ''));
    setExistingImages([]);
    setRemovedImages([]);
    clearSelectedImages();
  }, [adminCategories, clearSelectedImages]);

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
      if (isInventoryView) {
        quantityInputRef.current?.focus();
        return;
      }

      productNameInputRef.current?.focus();
    });
  }, [isInventoryView, productModalOpen]);

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

    const quantityInput = productForm.quantity.trim();
    const parsedQuantity = quantityInput === '' ? 0 : Number(quantityInput);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setAdminError('Tồn kho phải là số nguyên không âm');
      return;
    }

    if (isInventoryView) {
      if (!editingProductId) {
        setAdminError('Vui lòng chọn sản phẩm để cập nhật tồn kho');
        return;
      }

      try {
        setIsSubmittingProduct(true);
        setAdminError(null);

        const updated = await updateProductApi(editingProductId, {
          quantity: parsedQuantity,
        });

        setAdminProducts((prev) =>
          prev.map((product) => (product._id === updated._id ? updated : product))
        );

        setProductModalOpen(false);
        resetProductForm();
      } catch (error) {
        setAdminError(error instanceof Error ? error.message : 'Không thể cập nhật tồn kho');
      } finally {
        setIsSubmittingProduct(false);
      }

      return;
    }

    if (!productForm.name || !productForm.price || !productForm.category) {
      setAdminError('Vui lòng nhập đầy đủ tên, giá và danh mục sản phẩm');
      return;
    }

    const parsedPrice = Number(productForm.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setAdminError('Giá sản phẩm phải là số không âm');
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
      } = {
        name: productForm.name.trim(),
        price: parsedPrice,
        quantity: parsedQuantity,
        category: productForm.category,
        description: productForm.description.trim() || undefined,
      };

      let finalProduct: ApiProduct;

      if (editingProductId) {
        finalProduct = await updateProductApi(editingProductId, payload);

        // Delete removed existing images (best-effort, continue on failure)
        const deleteErrors: string[] = [];
        for (const imageUrl of removedImages) {
          try {
            finalProduct = await deleteProductImageApi(editingProductId, imageUrl);
          } catch {
            deleteErrors.push(imageUrl);
          }
        }

        // Upload new images
        if (selectedImageFiles.length > 0) {
          try {
            finalProduct = await uploadProductImagesApi(editingProductId, selectedImageFiles);
          } catch (uploadError) {
            // Update UI with what we have so far, then report error
            setAdminProducts((prev) =>
              prev.map((product) => (product._id === finalProduct._id ? finalProduct : product))
            );
            const msg =
              uploadError instanceof Error ? uploadError.message : 'Không thể tải ảnh lên';
            toast.error(msg);
            if (deleteErrors.length > 0) {
              toast.error(`Không thể xóa ${deleteErrors.length} ảnh cũ`);
            }
            setProductModalOpen(false);
            resetProductForm();
            return;
          }
        }

        if (deleteErrors.length > 0) {
          toast.warning(`Không thể xóa ${deleteErrors.length} ảnh cũ`);
        }

        setAdminProducts((prev) =>
          prev.map((product) => (product._id === finalProduct._id ? finalProduct : product))
        );
      } else {
        finalProduct = await createProductApi(payload);

        // Upload new images for newly created product
        if (selectedImageFiles.length > 0) {
          finalProduct = await uploadProductImagesApi(finalProduct._id, selectedImageFiles);
        }

        setAdminProducts((prev) => [finalProduct, ...prev]);
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
    setExistingImages(product.images ?? []);
    setRemovedImages([]);
    clearSelectedImages();
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
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const currentCount = visibleExistingImages.length + selectedImageFiles.length;
    const slotsAvailable = MAX_PRODUCT_IMAGES - currentCount;

    if (slotsAvailable <= 0) {
      toast.error('Tối đa 4 ảnh cho mỗi sản phẩm');
      event.target.value = '';
      return;
    }

    const validFiles: File[] = [];
    let hasError = false;

    for (const file of Array.from(files)) {
      if (validFiles.length >= slotsAvailable) {
        toast.error('Tối đa 4 ảnh cho mỗi sản phẩm');
        break;
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setImageUploadError('Chỉ hỗ trợ JPEG, PNG, WebP hoặc GIF');
        hasError = true;
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setImageUploadError('Dung lượng ảnh phải nhỏ hơn hoặc bằng 5MB');
        hasError = true;
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedImageFiles((prev) => [...prev, ...validFiles]);
      if (!hasError) {
        setImageUploadError(null);
      }
    }

    event.target.value = '';
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setRemovedImages((prev) => [...prev, imageUrl]);
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    // Blob URL cleanup is handled by the useMemo cache on next recomputation
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

  const getStockLevel = (quantity?: number) => {
    const value = quantity ?? 0;
    if (value <= 0) {
      return {
        label: 'Hết hàng',
        badgeClass:
          'inline-flex rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600',
        note: 'Cần nhập ngay',
      };
    }

    if (value <= 5) {
      return {
        label: 'Sắp hết',
        badgeClass:
          'inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700',
        note: 'Cần bổ sung',
      };
    }

    return {
      label: 'Ổn định',
      badgeClass:
        'inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700',
      note: 'Đủ bán',
    };
  };

  return (
    <div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {isInventoryView ? 'Bảng quản trị tồn kho' : 'Bảng quản trị sản phẩm'}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isInventoryView
              ? 'Theo dõi và điều chỉnh số lượng tồn kho theo từng sản phẩm.'
              : 'CRUD sản phẩm dành riêng cho tài khoản admin'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadAdminData}
            className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
          >
            Làm mới dữ liệu
          </button>
          {!isInventoryView && (
            <button
              onClick={openCreateModal}
              className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
            >
              Thêm sản phẩm
            </button>
          )}
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
              <th className="py-2 pr-2">Mô tả</th>
              <th className="py-2 pr-2">{isInventoryView ? 'Danh mục' : 'Giá'}</th>
              <th className="py-2 pr-2">Tồn kho</th>
              <th className="py-2 pr-2">{isInventoryView ? 'Mức tồn' : 'Danh mục'}</th>
              <th className="py-2 pr-2">{isInventoryView ? 'Khuyến nghị' : 'Trạng thái'}</th>
              <th className="py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {adminLoading ? (
              <tr>
                <td className="py-4 text-[var(--text-muted)]" colSpan={8}>
                  Đang tải dữ liệu quản trị...
                </td>
              </tr>
            ) : (
              displayedProducts.map((product) => {
                const stockLevel = getStockLevel(product.quantity);

                return (
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
                    <td className="py-3 pr-2">
                      {product.description ? (
                        <span className="text-sm text-gray-600" title={product.description}>
                          {product.description.length > 50
                            ? `${product.description.slice(0, 50)}...`
                            : product.description}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Chưa có mô tả</span>
                      )}
                    </td>
                    <td className="py-3 pr-2">
                      {isInventoryView
                        ? getCategoryName(product)
                        : `${Number(product.price).toLocaleString('vi-VN')}đ`}
                    </td>
                    <td className="py-3 pr-2">
                      {product.quantity > 0 ? `${product.quantity} sản phẩm` : 'Hết hàng'}
                    </td>
                    <td className="py-3 pr-2">
                      {isInventoryView ? (
                        <span className={stockLevel.badgeClass}>{stockLevel.label}</span>
                      ) : (
                        getCategoryName(product)
                      )}
                    </td>
                    <td className="py-3 pr-2">
                      {isInventoryView ? stockLevel.note : product.isActive ? 'Hiển thị' : 'Ẩn'}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="min-h-[36px] rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50"
                        >
                          {isInventoryView ? 'Cập nhật tồn' : 'Sửa'}
                        </button>
                        {!isInventoryView && (
                          <button
                            onClick={() => {
                              setAdminError(null);
                              setDeletingProduct(product);
                            }}
                            className="min-h-[36px] rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
                  {editingProductId
                    ? isInventoryView
                      ? 'Cập nhật tồn kho'
                      : 'Chỉnh sửa sản phẩm'
                    : 'Thêm sản phẩm mới'}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {isInventoryView
                    ? 'Chỉ chỉnh sửa số lượng tồn kho, không thay đổi thông tin sản phẩm khác.'
                    : 'Cập nhật thông tin sản phẩm và ảnh hiển thị ngay trong một modal.'}
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
              {isInventoryView ? (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 p-4 text-sm text-[var(--text-muted)] sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
                        Sản phẩm
                      </p>
                      <p className="mt-1 font-semibold text-[var(--text-primary)]">
                        {productForm.name || 'Không xác định'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
                        Danh mục
                      </p>
                      <p className="mt-1 font-medium text-[var(--text-primary)]">
                        {editingProduct ? getCategoryName(editingProduct) : 'Không xác định'}
                      </p>
                    </div>
                  </div>

                  <label className="space-y-1.5 text-sm font-medium text-[var(--text-primary)]">
                    Số lượng tồn kho
                    <input
                      id="product-quantity"
                      ref={quantityInputRef}
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
                </div>
              ) : (
                <>
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
                        id="product-quantity"
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
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        Ảnh sản phẩm
                        <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">
                          ({totalImageCount}/{MAX_PRODUCT_IMAGES})
                        </span>
                      </h4>
                    </div>

                    <label
                      className={`mb-3 flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-pink-300 bg-white px-3 py-2 text-sm font-medium transition-colors ${
                        isAtMaxImages
                          ? 'cursor-not-allowed border-pink-200 text-pink-300 opacity-60'
                          : 'text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      {isAtMaxImages
                        ? 'Đã đạt tối đa 4 ảnh'
                        : 'Chọn ảnh (JPEG/PNG/WebP/GIF, tối đa 5MB)'}
                      <input
                        ref={imageInputRef}
                        data-testid="product-image-input"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageFileChange}
                        disabled={isAtMaxImages}
                        className="sr-only"
                      />
                    </label>

                    {imageUploadError && (
                      <p className="mb-2 text-sm text-rose-600">{imageUploadError}</p>
                    )}

                    {totalImageCount > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {visibleExistingImages.map((url) => (
                          <div
                            key={url}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-pink-200 bg-white"
                          >
                            <Image
                              src={url}
                              alt="Ảnh sản phẩm hiện tại"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(url)}
                              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                              aria-label="Gỡ ảnh hiện tại"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {selectedImageFiles.map((file, index) => (
                          <div
                            key={`new-${file.name}-${file.size}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-pink-200 bg-white"
                          >
                            <Image
                              src={newImagePreviewUrls[index]}
                              alt={`Ảnh mới ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                              aria-label="Gỡ ảnh mới"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">
                        Chưa có ảnh nào. Bạn có thể thêm tối đa 4 ảnh cho sản phẩm.
                      </p>
                    )}
                  </div>
                </>
              )}

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
                    : isInventoryView
                      ? 'Cập nhật tồn kho'
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
