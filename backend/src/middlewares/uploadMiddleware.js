const multer = require("multer");
const { ValidationError } = require("../errors");

const storage = multer.memoryStorage();

const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (_req, file, cb) => {
		const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
			return;
		}

		cb(new ValidationError("Only JPEG, PNG, WebP, and GIF images are allowed"));
	},
});

const createImageUploadMiddleware =
	(fieldName, tooLargeMessage) => (req, res, next) => {
		upload.single(fieldName)(req, res, (error) => {
			if (!error) {
				next();
				return;
			}

			if (
				error instanceof multer.MulterError &&
				error.code === "LIMIT_FILE_SIZE"
			) {
				next(new ValidationError(tooLargeMessage));
				return;
			}

			next(error);
		});
	};

const uploadProductImage = createImageUploadMiddleware(
	"image",
	"Image file size must be 5MB or less",
);
const uploadAvatarImage = createImageUploadMiddleware(
	"avatar",
	"Avatar file size must be 5MB or less",
);

const uploadReviewImages = (req, res, next) => {
	upload.array("images", 3)(req, res, (error) => {
		if (!error) {
			next();
			return;
		}

		if (
			error instanceof multer.MulterError &&
			error.code === "LIMIT_FILE_SIZE"
		) {
			next(new ValidationError("Mỗi ảnh đánh giá không được vượt quá 5MB"));
			return;
		}

		if (
			error instanceof multer.MulterError &&
			error.code === "LIMIT_UNEXPECTED_FILE"
		) {
			next(new ValidationError("Chỉ được tải lên tối đa 3 ảnh"));
			return;
		}

		next(error);
	});
};

const uploadProductImages = (req, res, next) => {
	upload.array("images", 4)(req, res, (error) => {
		if (!error) {
			next();
			return;
		}

		if (
			error instanceof multer.MulterError &&
			error.code === "LIMIT_FILE_SIZE"
		) {
			next(new ValidationError("Mỗi ảnh sản phẩm không được vượt quá 5MB"));
			return;
		}

		if (
			error instanceof multer.MulterError &&
			error.code === "LIMIT_UNEXPECTED_FILE"
		) {
			next(new ValidationError("Chỉ được tải lên tối đa 4 ảnh"));
			return;
		}

		next(error);
	});
};

module.exports = uploadProductImage;
module.exports.uploadProductImages = uploadProductImages;
module.exports.uploadAvatarImage = uploadAvatarImage;
module.exports.uploadReviewImages = uploadReviewImages;
