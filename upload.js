const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  cb(null, allowedTypes.includes(file.mimetype));
};

module.exports = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }
});