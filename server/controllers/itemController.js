// --- START OF FILE server/controllers/itemController.js ---

const { getItems, getItemById, saveItemCustomization } = require('../services/fileSystemService');
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
const getAllItems = async (req, res) => {
  try {
    // Get language from query parameter, defaulting to 'en'
    const language = req.query.lang || 'en';
    
    const items = getItems(language).map(item => {
      // Add descriptions arrays to maintain compatibility with frontend
      return {
        ...item,
        descriptions: []  // Empty descriptions as we're using hardcoded matching logic
      };
    });
    res.json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get item by ID
const getItemByIdHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Get language from query parameter, defaulting to 'en'
    const language = req.query.lang || 'en';
    
    const item = getItemById(id, language);
    
    if (item) {
      // Add descriptions array to maintain compatibility with frontend
      const result = {
        ...item,
        descriptions: []  // Empty descriptions as we're using hardcoded matching logic
      };
      res.json(result);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error getting item by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// These functions are kept for API compatibility but won't actually create/update/delete
const createItem = async (req, res) => {
  res.status(400).json({ message: 'Creating new items is not supported in file-based mode' });
};

const updateItem = async (req, res) => {
  res.status(400).json({ message: 'Updating items is not supported in file-based mode' });
};

const deleteItem = async (req, res) => {
  res.status(400).json({ message: 'Deleting items is not supported in file-based mode' });
};

// New function to update item customization
const updateItemCustomization = async (req, res) => {
  try {
    const { id } = req.params;
    const customData = req.body;
    
    if (!id || !customData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const success = saveItemCustomization(parseInt(id), customData);
    
    if (success) {
      // Get the updated item with the requested language
      const lang = req.query.lang || 'en';
      const updatedItem = getItemById(id, lang);
      
      return res.json(updatedItem);
    } else {
      return res.status(400).json({ message: 'Failed to update item customization' });
    }
  } catch (error) {
    console.error('Error updating item customization:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems: getAllItems,
  getItemById: getItemByIdHandler,
  createItem,
  updateItem,
  deleteItem,
  updateItemCustomization
};
// --- END OF FILE server/controllers/itemController.js ---