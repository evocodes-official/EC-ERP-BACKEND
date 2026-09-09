const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/jwt');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

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
  limits: { fileSize: config.UPLOAD_MAX_SIZE_MB * 1024 * 1024 }
});

exports.uploadImage = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File is too large. Maximum size is ${config.UPLOAD_MAX_SIZE_MB} MB.`
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file field. Use "image" as the field name.'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload failed: ${err.message}`
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided.'
        });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const url = `${baseUrl}/uploads/${file.filename}`;

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        url,
        path: `/uploads/${file.filename}`,
        filename: file.filename
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error during upload",
        error: config.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });
};