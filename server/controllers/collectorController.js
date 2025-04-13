const { getCollectors, getCollectorById } = require('../services/fileSystemService');

// Get all collectors
const getAllCollectors = async (req, res) => {
  try {
    // Get language from query parameter, defaulting to 'en'
    const language = req.query.lang || 'en';
    
    const collectors = getCollectors(language).map(collector => {
      // Add descriptions arrays to maintain compatibility with frontend
      return {
        ...collector,
        descriptions: []  // Empty descriptions as we're using hardcoded matching logic
      };
    });
    res.json(collectors);
  } catch (error) {
    console.error('Error getting collectors:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get collector by ID
const getCollectorByIdHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Get language from query parameter, defaulting to 'en'
    const language = req.query.lang || 'en';
    
    const collector = getCollectorById(id, language);
    
    if (collector) {
      // Add descriptions array to maintain compatibility with frontend
      const result = {
        ...collector,
        descriptions: []  // Empty descriptions as we're using hardcoded matching logic
      };
      res.json(result);
    } else {
      res.status(404).json({ message: 'Collector not found' });
    }
  } catch (error) {
    console.error('Error getting collector by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// These functions are kept for API compatibility but won't actually create/update/delete
const createCollector = async (req, res) => {
  res.status(400).json({ message: 'Creating new collectors is not supported in file-based mode' });
};

const updateCollector = async (req, res) => {
  res.status(400).json({ message: 'Updating collectors is not supported in file-based mode' });
};

const deleteCollector = async (req, res) => {
  res.status(400).json({ message: 'Deleting collectors is not supported in file-based mode' });
};

module.exports = {
  getCollectors: getAllCollectors,
  getCollectorById: getCollectorByIdHandler,
  createCollector,
  updateCollector,
  deleteCollector
};
