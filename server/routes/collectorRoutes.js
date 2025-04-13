// --- START OF FILE server/routes/collectorRoutes.js ---

const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/collectorController'); // Assuming controller path is correct
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for directory creation

// Configure storage for uploaded collector images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Get language from query params, default to 'en'
    const lang = req.query.lang || 'en';
    
    // Path relative from server/routes -> server -> game research -> client/public/images
    const uploadDir = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'collectors', lang);
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
    // Create a unique filename for the collector image
    cb(null, `collector-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to accept only images
const fileFilter = function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only! (jpeg, jpg, png, gif, webp)'));
    }
  };

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: fileFilter
});

// --- Routes ---
router.get('/', collectorController.getCollectors);
router.get('/:id', collectorController.getCollectorById);

// IMPORTANT: collectorController.createCollector/updateCollector needs to be updated
// to save the correct image path (e.g., '/images/collectors/{language}/collector-123.jpg').
router.post('/', upload.single('image'), collectorController.createCollector);
router.put('/:id', upload.single('image'), collectorController.updateCollector);
router.delete('/:id', collectorController.deleteCollector);

module.exports = router;
// --- END OF FILE server/routes/collectorRoutes.js ---