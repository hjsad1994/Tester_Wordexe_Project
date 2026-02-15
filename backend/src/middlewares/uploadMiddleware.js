const multer = require('multer');
const { ValidationError } = require('../errors');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new ValidationError('Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});

const uploadProductImage = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError('Image file size must be 5MB or less'));
      return;
    }

    next(error);
  });
};

module.exports = uploadProductImage;
