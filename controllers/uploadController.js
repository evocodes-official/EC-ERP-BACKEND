const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

// Only allow image files
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// Handle image upload — accepts the file under ANY form field name,
// with explicit error handling so multer issues return clear 400s
// instead of Express's generic 500.
exports.uploadImage = (req, res) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'File is too large. Maximum size is 5 MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ message: 'Too many files. Please upload a single image.' });
        }
        return res.status(400).json({ message: `Upload failed: ${err.message}` });
      }
      // Custom filter error (e.g. non-image file)
      return res.status(400).json({ message: err.message });
    }

    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return res.status(400).json({ message: 'No image file provided.' });
      }
      // Build a fully-qualified URL so the frontend can use it directly
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const url = `${baseUrl}/uploads/${file.filename}`;

      res.status(201).json({
        message: 'Image uploaded successfully',
        url,
        path: `/uploads/${file.filename}`,
        filename: file.filename
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
