const mongoose = require("mongoose");

const toBaseSlug = (value = "") => {
	const normalized = String(value)
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{M}+/gu, "")
		.replace(/đ/g, "d")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return normalized || "san-pham";
};

const createProductSlug = (name) => {
	const baseSlug = toBaseSlug(name);
	const suffix = Date.now().toString(36);
	return `${baseSlug}-${suffix}`;
};

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
			trim: true,
			maxlength: [200, "Product name cannot exceed 200 characters"],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		price: {
			type: Number,
			required: [true, "Price is required"],
			min: [0, "Price cannot be negative"],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: [true, "Category is required"],
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		sku: {
			type: String,
			unique: true,
			sparse: true,
			trim: true,
		},
		quantity: {
			type: Number,
			default: 0,
			min: [0, "Quantity cannot be negative"],
		},
		images: [
			{
				type: String,
				trim: true,
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
		avgRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		reviewCount: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: true,
	},
);

productSchema.pre("save", function (next) {
	if (this.isModified("name")) {
		this.slug = createProductSlug(this.name);
	}
	next();
});

productSchema.pre("findOneAndUpdate", function (next) {
	const update = this.getUpdate() || {};
	const updateName = update.name || update.$set?.name;

	if (!updateName) {
		next();
		return;
	}

	const slug = createProductSlug(updateName);
	if (update.$set) {
		update.$set.slug = slug;
	} else {
		update.slug = slug;
	}

	next();
});

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
