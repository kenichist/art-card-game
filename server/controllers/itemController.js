const Item = require('../models/itemModel');

// Get all items
const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { id, name, descriptions } = req.body;
    
    // Check if item with this ID already exists
    const itemExists = await Item.findOne({ id });
    if (itemExists) {
      return res.status(400).json({ message: 'Item with this ID already exists' });
    }
    
    // Create image path
    const image = req.file ? `/images/${req.file.filename}` : `/images/item-${id}.jpg`;
    
    // Parse descriptions if they come as a string
    let parsedDescriptions = descriptions;
    if (typeof descriptions === 'string') {
      parsedDescriptions = JSON.parse(descriptions);
    }
    
    const item = new Item({
      id,
      name,
      image,
      descriptions: parsedDescriptions
    });
    
    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { name, descriptions } = req.body;
    
    const item = await Item.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update fields
    item.name = name || item.name;
    
    // Update image if provided
    if (req.file) {
      item.image = `/images/${req.file.filename}`;
    }
    
    // Parse descriptions if they come as a string
    if (descriptions) {
      let parsedDescriptions = descriptions;
      if (typeof descriptions === 'string') {
        parsedDescriptions = JSON.parse(descriptions);
      }
      item.descriptions = parsedDescriptions;
    }
    
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await item.remove();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
