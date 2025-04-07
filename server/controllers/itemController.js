// --- START OF FILE server/controllers/itemController.js ---

const Item = require('../models/itemModel');
const fs = require('fs'); // Needed for file deletion
const path = require('path'); // Needed for path joining

// --- Helper function to get the absolute path to an image file in client/public/images ---
const getPublicImagePath = (relativePath) => {
    // relativePath should start with /images/ e.g., /images/item-123.jpg
    if (!relativePath || !relativePath.startsWith('/images/')) {
        return null;
    }
    // Go from server/controllers -> server -> project_root -> client/public
    return path.join(__dirname, '..', '..', 'client', 'public', relativePath);
};

// --- Helper function to safely delete a file ---
const deleteFile = (filePath) => {
    if (!filePath) return;
    const absolutePath = getPublicImagePath(filePath);
    if (!absolutePath) {
        console.warn(`Skipping deletion, invalid path: ${filePath}`);
        return;
    }
    fs.unlink(absolutePath, (err) => {
        if (err && err.code !== 'ENOENT') { // ENOENT = file already gone, not an error here
            console.error(`Error deleting file ${absolutePath}:`, err);
        } else if (!err) {
             console.log(`Successfully deleted file: ${absolutePath}`);
        }
    });
};


// Get all items
const getItems = async (req, res, next) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    console.error("Get Items Error:", error);
    error.message = `Server error fetching items: ${error.message}`;
    error.status = 500;
    next(error);
  }
};

// Get item by ID
const getItemById = async (req, res, next) => {
  try {
    // Ensure ID is treated as a number for the query
    const item = await Item.findOne({ id: Number(req.params.id) });
    if (item) {
      res.json(item);
    } else {
      const error = new Error('Item not found');
      error.status = 404;
      next(error);
    }
  } catch (error) {
    console.error(`Get Item By ID (${req.params.id}) Error:`, error);
    error.message = `Server error fetching item by ID: ${error.message}`;
    error.status = 500;
    next(error);
  }
};

// Create new item
const createItem = async (req, res, next) => {
  console.log('Create Item Request Body:', req.body);
  console.log('Create Item Request File:', req.file);

  // --- File Handling: Use req.file from upload.single ---
  if (!req.file) {
    const error = new Error('Item image file is required.');
    error.status = 400;
    return next(error);
  }

  const imageFile = req.file;
  let parsedDescriptions; // To store parsed descriptions

  try {
    const { id, name, descriptions } = req.body;

    // --- Basic Input Validation ---
    if (!id || !name || !descriptions) {
         // If validation fails after upload, delete the uploaded file
         fs.unlinkSync(imageFile.path); // Use sync here for simplicity before responding
         const error = new Error('Missing required fields (id, name, descriptions).');
         error.status = 400;
         return next(error);
    }

    // --- Check for existing ID ---
    const numericId = Number(id);
    if (isNaN(numericId)) {
        fs.unlinkSync(imageFile.path);
        const error = new Error('Invalid ID format. ID must be a number.');
        error.status = 400;
        return next(error);
    }

    const itemExists = await Item.findOne({ id: numericId });
    if (itemExists) {
      fs.unlinkSync(imageFile.path); // Delete uploaded file if ID exists
      const error = new Error('Item with this ID already exists');
      error.status = 409; // 409 Conflict is more appropriate
      return next(error);
    }

    // --- Parse descriptions ---
    try {
        parsedDescriptions = JSON.parse(descriptions);
        // Validate format: should be array of objects with 'attribute' string
        if (!Array.isArray(parsedDescriptions) || parsedDescriptions.some(d => typeof d?.attribute !== 'string')) {
            throw new Error('Invalid description structure.');
        }
    } catch (e) {
        fs.unlinkSync(imageFile.path); // Delete uploaded file on format error
        const error = new Error('Invalid descriptions format. Must be a JSON array like [{"attribute":"desc1"}, {"attribute":"desc2"}].');
        error.status = 400;
        return next(error);
    }

    // --- Construct web-accessible image path ---
    const imagePath = `/images/${imageFile.filename}`; // Path relative to public root

    // --- Create and Save Item ---
    const item = new Item({
      id: numericId,
      name,
      image: imagePath,
      descriptions: parsedDescriptions,
      // No modelPath anymore
    });

    const createdItem = await item.save();
    console.log('Item created successfully:', createdItem);
    res.status(201).json(createdItem);

  } catch (error) {
     // Catch database errors or other unexpected issues
     console.error("Create Item - Internal Error:", error);

     // Attempt to delete the uploaded file if it exists and wasn't handled above
     if (imageFile?.path) {
         try { fs.unlinkSync(imageFile.path); } catch (e) { console.error("Error during cleanup unlink:", e)}
     }

     error.message = `Server error during item creation: ${error.message}`;
     error.status = error.status || 500;
     next(error);
  }
};

// Update item
const updateItem = async (req, res, next) => {
  console.log('Update Item Request Body:', req.body);
  console.log('Update Item Request File:', req.file);
  console.log('Update Item ID:', req.params.id);

  let newImageFile = req.file; // File object if a new image was uploaded
  let oldImagePath = null; // To store the path of the image being replaced

  try {
    const { name, descriptions } = req.body;
    const itemId = Number(req.params.id);

    if (isNaN(itemId)) {
        const error = new Error('Invalid Item ID for update.');
        error.status = 400;
        // If a file was uploaded with the bad request, delete it
        if (newImageFile) fs.unlinkSync(newImageFile.path);
        return next(error);
    }

    const item = await Item.findOne({ id: itemId });
    if (!item) {
        const error = new Error('Item not found for update');
        error.status = 404;
        // If a file was uploaded for a non-existent item, delete it
        if (newImageFile) fs.unlinkSync(newImageFile.path);
        return next(error);
    }

    oldImagePath = item.image; // Store the old path before potentially updating

    // Update name if provided
    if (name) {
        item.name = name;
    }

    // Update image path if new image uploaded
    if (newImageFile) {
      item.image = `/images/${newImageFile.filename}`;
    }

    // Update descriptions if provided
    if (descriptions) {
        try {
            let parsedDescriptions = JSON.parse(descriptions);
             // Validate format
            if (!Array.isArray(parsedDescriptions) || parsedDescriptions.some(d => typeof d?.attribute !== 'string')) {
                 throw new Error('Invalid description structure.');
            }
            item.descriptions = parsedDescriptions;
        } catch (e) {
            const error = new Error('Invalid descriptions format on update.');
            error.status = 400;
            // If a file was uploaded with the bad descriptions, delete it
            if (newImageFile) fs.unlinkSync(newImageFile.path);
            return next(error);
        }
    }

    const updatedItem = await item.save();

    // If update was successful AND a new image was uploaded, delete the old one
    if (newImageFile && oldImagePath && oldImagePath !== item.image) {
        deleteFile(oldImagePath); // Use helper to delete the old file
    }

    res.json(updatedItem);

  } catch (error) {
     console.error("Update Item - Internal Error:", error);
     // Attempt to delete newly uploaded file on error during update process
     if (newImageFile?.path) {
        try { fs.unlinkSync(newImageFile.path); } catch (e) { console.error("Error during update cleanup unlink:", e)}
     }
     error.message = `Server error during item update: ${error.message}`;
     error.status = error.status || 500;
     next(error);
  }
};

// Delete item
const deleteItem = async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
     if (isNaN(itemId)) {
        const error = new Error('Invalid Item ID for deletion.');
        error.status = 400;
        return next(error);
    }

    // Find the item first to get the image path for deletion
    const item = await Item.findOne({ id: itemId });
    if (!item) {
        const error = new Error('Item not found for deletion');
        error.status = 404;
        return next(error);
    }

    const imagePathToDelete = item.image; // Get path before deleting DB record

    // Delete the database record
    const result = await Item.deleteOne({ id: itemId });

    if (result.deletedCount === 0) {
        // Should not happen if findOne worked, but good check
        const error = new Error('Item found but failed to delete from database');
        error.status = 500;
        return next(error);
    }

    // If DB deletion successful, delete the associated image file
    deleteFile(imagePathToDelete); // Use helper

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
// --- END OF FILE server/controllers/itemController.js ---