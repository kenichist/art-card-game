const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');
const path = require('path');

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function(req, file, cb) {
    cb(null, `item-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Routes
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.post('/', upload.single('image'), itemController.createItem);
router.put('/:id', upload.single('image'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
