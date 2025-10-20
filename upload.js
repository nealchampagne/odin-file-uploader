const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (_, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  cb(null, allowedTypes.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });