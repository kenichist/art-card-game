// --- START OF FILE server/routes/itemRoutes.js ---

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for directory creation

// Configure storage for uploaded item images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Get language from query params, default to 'en'
    const lang = req.query.lang || 'en';
    
    // Path relative from server/routes -> server -> game research -> client/public/images
    const uploadDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'items', lang);
    // Ensure the directory exists
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir); // Save files to this directory
    } catch (err) {
      console.error("Failed to create upload directory:", err);
      cb(err); // Pass error if directory creation fails
    }
  },
  filename: function(req, file, cb) {
    // Create a unique filename for the item image
    cb(null, `item-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: fileFilter
});

// --- Routes ---
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Use upload.single() for POST (only 'image' field)
// IMPORTANT: itemController.createItem needs to be updated
// to handle descriptions as an array of strings and save the correct image path.
router.post('/', upload.single('image'), itemController.createItem);

// Use upload.single() for PUT (only 'image' field)
// IMPORTANT: itemController.updateItem needs to be updated
// to handle descriptions as an array of strings and save the correct image path if changed.
router.put('/:id', upload.single('image'), itemController.updateItem);

router.delete('/:id', itemController.deleteItem);

module.exports = router;
// --- END OF FILE server/routes/itemRoutes.js ---