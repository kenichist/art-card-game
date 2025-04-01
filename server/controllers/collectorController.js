const Collector = require('../models/collectorModel');

// Get all collectors
const getCollectors = async (req, res) => {
  try {
    const collectors = await Collector.find({});
    res.json(collectors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get collector by ID
const getCollectorById = async (req, res) => {
  try {
    const collector = await Collector.findOne({ id: req.params.id });
    if (collector) {
      res.json(collector);
    } else {
      res.status(404).json({ message: 'Collector not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new collector
const createCollector = async (req, res) => {
  try {
    const { id, name, descriptions } = req.body;
    
    // Check if collector with this ID already exists
    const collectorExists = await Collector.findOne({ id });
    if (collectorExists) {
      return res.status(400).json({ message: 'Collector with this ID already exists' });
    }
    
    // Create image path
    const image = req.file ? `/images/${req.file.filename}` : `/images/collector-${id}.jpg`;
    
    // Parse descriptions if they come as a string
    let parsedDescriptions = descriptions;
    if (typeof descriptions === 'string') {
      parsedDescriptions = JSON.parse(descriptions);
    }
    
    const collector = new Collector({
      id,
      name,
      image,
      descriptions: parsedDescriptions
    });
    
    const createdCollector = await collector.save();
    res.status(201).json(createdCollector);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update collector
const updateCollector = async (req, res) => {
  try {
    const { name, descriptions } = req.body;
    
    const collector = await Collector.findOne({ id: req.params.id });
    if (!collector) {
      return res.status(404).json({ message: 'Collector not found' });
    }
    
    // Update fields
    collector.name = name || collector.name;
    
    // Update image if provided
    if (req.file) {
      collector.image = `/images/${req.file.filename}`;
    }
    
    // Parse descriptions if they come as a string
    if (descriptions) {
      let parsedDescriptions = descriptions;
      if (typeof descriptions === 'string') {
        parsedDescriptions = JSON.parse(descriptions);
      }
      collector.descriptions = parsedDescriptions;
    }
    
    const updatedCollector = await collector.save();
    res.json(updatedCollector);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete collector
const deleteCollector = async (req, res) => {
  try {
    const collector = await Collector.findOne({ id: req.params.id });
    if (!collector) {
      return res.status(404).json({ message: 'Collector not found' });
    }
    
    await collector.remove();
    res.json({ message: 'Collector removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCollectors,
  getCollectorById,
  createCollector,
  updateCollector,
  deleteCollector
};
