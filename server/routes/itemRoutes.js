// --- START OF FILE routes/itemRoutes.js ---

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for directory creation

// Configure storage for uploaded images and models
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Save all item-related uploads to a specific sub-directory
    // Example: public/uploads/items/
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'items');
    // Ensure the directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir); // Save files to this directory
  },
  filename: function(req, file, cb) {
    // Create a unique filename using fieldname and timestamp
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to accept images for 'image' field and glb/gltf for 'model' field
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    // Accept common image formats
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format! Only JPG, PNG, GIF, WEBP allowed.'), false); // Pass error to controller
    }
  } else if (file.fieldname === "model") {
    // Accept GLB and GLTF
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.glb' || ext === '.gltf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid model format! Only GLB, GLTF allowed.'), false); // Pass error
    }
  } else {
    // Reject any other unexpected field
    cb(new Error('Unexpected file field!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 }, // Increased limit to 50MB for models (adjust as needed)
  fileFilter: fileFilter // Apply the filter
});

// --- Routes ---
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);

// Use upload.fields() for POST to accept both 'image' and 'model'
router.post('/', upload.fields([
    { name: 'image', maxCount: 1 }, // Required image field
    { name: 'model', maxCount: 1 }  // Optional model field
]), itemController.createItem); // Pass control to the updated controller

// Use upload.fields() for PUT as well, if you want to allow updating files
router.put('/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
]), itemController.updateItem); // Ensure updateItem controller is updated too

router.delete('/:id', itemController.deleteItem);

module.exports = router;
// --- END OF FILE routes/itemRoutes.js ---