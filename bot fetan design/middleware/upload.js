
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  'uploads/posts',
  'uploads/products', 
  'uploads/gallery',
  'uploads/payments',
  'uploads/screenshots'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on route
    if (req.route.path.includes('/posts')) {
      uploadPath += 'posts/';
    } else if (req.route.path.includes('/products')) {
      uploadPath += 'products/';
    } else if (req.route.path.includes('/gallery')) {
      uploadPath += 'gallery/';
    } else if (req.route.path.includes('/payments')) {
      uploadPath += 'payments/';
    } else if (req.route.path.includes('/screenshots')) {
      uploadPath += 'screenshots/';
    } else {
      uploadPath += 'general/';
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Export different upload configurations
module.exports = {
  single: (fieldName) => upload.single(fieldName),
  multiple: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
  fields: (fields) => upload.fields(fields)
};
