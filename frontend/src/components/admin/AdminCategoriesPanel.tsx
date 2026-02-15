"use client";

import { useEffect, useState } from "react";
import {
	type Category as ApiCategory,
	createCategory,
	deleteCategory,
	fetchCategories,
	updateCategory,
} from "@/lib/api";

export default function AdminCategoriesPanel() {
	const [adminCategories, setAdminCategories] = useState<ApiCategory[]>([]);
	const [adminError, setAdminError] = useState<string | null>(null);
	const [adminLoading, setAdminLoading] = useState(false);
	const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
		null,
	);
	const [categoryForm, setCategoryForm] = useState({
		name: "",
		description: "",
	});

	useEffect(() => {
		const loadCategories = async () => {
			setAdminLoading(true);
			setAdminError(null);

			try {
				const data = await fetchCategories();
				setAdminCategories(data);
			} catch (error) {
				setAdminError(
					error instanceof Error
						? error.message
						: "Không thể tải danh mục quản trị",
				);
			} finally {
				setAdminLoading(false);
			}
		};

		void loadCategories();
	}, []);

	const resetForm = () => {
		setEditingCategoryId(null);
		setCategoryForm({ name: "", description: "" });
	};

	const handleCategorySubmit = async () => {
		if (!categoryForm.name.trim()) {
			setAdminError("Tên danh mục là bắt buộc");
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
					prev.map((category) =>
						category._id === updated._id ? updated : category,
					),
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
			setAdminError(
				error instanceof Error ? error.message : "Không thể lưu danh mục",
			);
		}
	};

	const handleEditCategory = (category: ApiCategory) => {
		setEditingCategoryId(category._id);
		setCategoryForm({
			name: category.name,
			description: category.description || "",
		});
	};

	const handleDeleteCategory = async (categoryId: string) => {
		try {
			setAdminError(null);
			await deleteCategory(categoryId);
			setAdminCategories((prev) =>
				prev.filter((category) => category._id !== categoryId),
			);
			if (editingCategoryId === categoryId) {
				resetForm();
			}
		} catch (error) {
			setAdminError(
				error instanceof Error ? error.message : "Không thể xóa danh mục",
			);
		}
	};

	return (
		<div className="rounded-3xl border border-pink-200 bg-white p-5 shadow-sm sm:p-6">
			<h3 className="text-lg font-bold text-[var(--text-primary)]">
				Quản trị danh mục
			</h3>
			<p className="mt-1 mb-4 text-sm text-[var(--text-muted)]">
				Tạo, chỉnh sửa và xóa danh mục sản phẩm ngay trên trang này.
			</p>

			{adminError && (
				<div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
					{adminError}
				</div>
			)}

			<div className="mb-3 grid gap-3 md:grid-cols-2">
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
					className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
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
					className="rounded-xl border border-pink-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
				/>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				<button
					onClick={handleCategorySubmit}
					className="min-h-[44px] rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
				>
					{editingCategoryId ? "Cập nhật danh mục" : "Tạo danh mục"}
				</button>
				{editingCategoryId && (
					<button
						onClick={resetForm}
						className="min-h-[44px] rounded-xl border border-pink-300 px-4 py-2.5 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50"
					>
						Hủy chỉnh sửa
					</button>
				)}
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-[560px] w-full text-sm">
					<thead>
						<tr className="border-b border-pink-100 text-left text-[var(--text-muted)]">
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
									<td className="py-3 pr-2 text-[var(--text-muted)]">
										{category.slug}
									</td>
									<td className="py-3 pr-2">
										{category.isActive ? "Hiển thị" : "Ẩn"}
									</td>
									<td className="py-3">
										<div className="flex gap-2">
											<button
												onClick={() => handleEditCategory(category)}
												className="rounded-lg border border-pink-300 px-3 py-1.5 text-pink-600 transition-colors hover:bg-pink-50"
											>
												Sửa
											</button>
											<button
												onClick={() => void handleDeleteCategory(category._id)}
												className="rounded-lg border border-rose-300 px-3 py-1.5 text-rose-600 transition-colors hover:bg-rose-50"
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
	);
}
