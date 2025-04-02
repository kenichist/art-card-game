// --- START OF FILE itemController.js ---

const Item = require('../models/itemModel');
const multer = require('multer'); // Import multer to check for MulterError instance
const fs = require('fs'); // Needed for potential file deletion on update/delete
const path = require('path'); // Needed for path joining

// Get all items (remains the same)
const getItems = async (req, res, next) => { // Added next for error handling consistency
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    // Pass error to the central error handler
    error.status = 500;
    next(error);
  }
};

// Get item by ID (remains the same)
const getItemById = async (req, res, next) => { // Added next
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (item) {
      res.json(item);
    } else {
      const error = new Error('Item not found');
      error.status = 404;
      next(error); // Pass 404 error
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

// --- UPDATED Create new item ---
const createItem = async (req, res, next) => { // Added next
  try {
    const { id, name, descriptions } = req.body;

    // --- Basic Input Validation ---
    if (!id || !name || !descriptions) {
         const error = new Error('Missing required fields (id, name, descriptions).');
         error.status = 400;
         return next(error);
    }

    // --- File Handling ---
    // Check if files object exists and if the required 'image' field is present
    if (!req.files || !req.files.image || req.files.image.length === 0) {
        const error = new Error('Required item image file is missing.');
        error.status = 400;
        // If a model was uploaded without image, attempt to delete it (optional cleanup)
        if (req.files?.model?.[0]?.path) {
             fs.unlink(req.files.model[0].path, (err) => {
                 if(err) console.error("Error deleting orphaned model file:", err);
             });
        }
        return next(error);
    }

    const imageFile = req.files.image[0];
    const modelFile = req.files.model ? req.files.model[0] : null; // Model is optional

    // --- Check for existing ID ---
    const itemExists = await Item.findOne({ id: Number(id) }); // Ensure ID check is numeric
    if (itemExists) {
      const error = new Error('Item with this ID already exists');
      error.status = 400;
       // Delete uploaded files if ID exists
      fs.unlink(imageFile.path, (err) => { if(err) console.error("Error deleting image file on duplicate ID:", err); });
      if(modelFile) fs.unlink(modelFile.path, (err) => { if(err) console.error("Error deleting model file on duplicate ID:", err); });
      return next(error);
    }

    // --- Construct web-accessible paths (relative to static serving root) ---
    // Assumes files are in 'public/uploads/items' and '/uploads' is served
    const imagePath = `/uploads/items/${imageFile.filename}`;
    const modelPath = modelFile ? `/uploads/items/${modelFile.filename}` : null;

    // --- Parse descriptions ---
    let parsedDescriptions;
    try {
        parsedDescriptions = JSON.parse(descriptions);
        if (!Array.isArray(parsedDescriptions)) throw new Error(); // Ensure it's an array
    } catch (e) {
        const error = new Error('Invalid descriptions format (must be a JSON array).');
        error.status = 400;
        // Delete uploaded files on format error
        fs.unlink(imageFile.path, (err) => { if(err) console.error("Error deleting image file on desc error:", err); });
        if(modelFile) fs.unlink(modelFile.path, (err) => { if(err) console.error("Error deleting model file on desc error:", err); });
        return next(error);
    }

    // --- Create and Save Item ---
    const item = new Item({
      id: Number(id),
      name,
      image: imagePath,
      descriptions: parsedDescriptions,
      modelPath: modelPath // Add the model path (will be null if no modelFile)
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);

  } catch (error) {
     // Log internal errors, pass to central handler
     console.error("Create Item - Internal Error:", error);
     error.message = `Server error during item creation: ${error.message}`;
     error.status = error.status || 500; // Keep status if already set (e.g., by Multer)
     next(error);
  }
};

// --- UPDATED Update item ---
const updateItem = async (req, res, next) => { // Added next
  try {
    const { name, descriptions } = req.body;
    const itemId = req.params.id;

    const item = await Item.findOne({ id: itemId });
    if (!item) {
        const error = new Error('Item not found');
        error.status = 404;
        return next(error);
    }

    // Store old paths for potential deletion
    const oldImagePath = item.image;
    const oldModelPath = item.modelPath;

    // --- Handle File Updates ---
    const imageFile = req.files?.image ? req.files.image[0] : null;
    const modelFile = req.files?.model ? req.files.model[0] : null;

    // Update name if provided
    item.name = name || item.name;

    // Update image path if new image uploaded
    if (imageFile) {
      item.image = `/uploads/items/${imageFile.filename}`;
      // Optionally delete old image file
      if (oldImagePath) {
        const oldImageFsPath = path.join(__dirname, '..', 'public', oldImagePath);
        fs.unlink(oldImageFsPath, (err) => { if(err && err.code !== 'ENOENT') console.error("Error deleting old image:", err); });
      }
    }

    // Update model path if new model uploaded
    if (modelFile) {
      item.modelPath = `/uploads/items/${modelFile.filename}`;
       // Optionally delete old model file
       if (oldModelPath) {
        const oldModelFsPath = path.join(__dirname, '..', 'public', oldModelPath);
        fs.unlink(oldModelFsPath, (err) => { if(err && err.code !== 'ENOENT') console.error("Error deleting old model:", err); });
      }
    }
    // Potential logic to remove model (requires frontend to send a flag e.g., removeModel=true)
    // else if (req.body.removeModel === 'true' && oldModelPath) {
    //    item.modelPath = null;
    //    const oldModelFsPath = path.join(__dirname, '..', 'public', oldModelPath);
    //    fs.unlink(oldModelFsPath, (err) => { if(err && err.code !== 'ENOENT') console.error("Error deleting removed model:", err); });
    // }


    // Update descriptions if provided
    if (descriptions) {
        try {
            let parsedDescriptions = JSON.parse(descriptions);
            if (!Array.isArray(parsedDescriptions)) throw new Error();
            item.descriptions = parsedDescriptions;
        } catch (e) {
            const error = new Error('Invalid descriptions format.');
            error.status = 400;
            // If files were uploaded in this invalid request, delete them
             if (imageFile) fs.unlink(imageFile.path, (err) => { if(err) console.error("Error deleting image file on update desc error:", err); });
             if (modelFile) fs.unlink(modelFile.path, (err) => { if(err) console.error("Error deleting model file on update desc error:", err); });
            return next(error);
        }
    }

    const updatedItem = await item.save();
    res.json(updatedItem);

  } catch (error) {
     console.error("Update Item - Internal Error:", error);
     error.message = `Server error during item update: ${error.message}`;
     error.status = error.status || 500;
     next(error);
  }
};

// --- UPDATED Delete item ---
const deleteItem = async (req, res, next) => { // Added next
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (!item) {
        const error = new Error('Item not found for deletion');
        error.status = 404;
        return next(error);
    }

    // --- Delete associated files before removing DB record ---
    if (item.image) {
         const imageFsPath = path.join(__dirname, '..', 'public', item.image);
         fs.unlink(imageFsPath, (err) => { if(err && err.code !== 'ENOENT') console.error("Error deleting image on item delete:", err); });
    }
     if (item.modelPath) {
         const modelFsPath = path.join(__dirname, '..', 'public', item.modelPath);
         fs.unlink(modelFsPath, (err) => { if(err && err.code !== 'ENOENT') console.error("Error deleting model on item delete:", err); });
    }

    // Use deleteOne or deleteMany for modern Mongoose
    const result = await Item.deleteOne({ id: req.params.id });

    if (result.deletedCount === 0) { // Should not happen if findOne worked, but good check
        const error = new Error('Item found but failed to delete');
        error.status = 404; // Or 500
        return next(error);
    }

    res.json({ message: 'Item removed successfully' });

  } catch (error) {
     console.error("Delete Item - Internal Error:", error);
     error.message = `Server error during item deletion: ${error.message}`;
     error.status = 500;
     next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
// --- END OF FILE itemController.js ---