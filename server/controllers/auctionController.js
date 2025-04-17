const path = require('path');
const { getItemById, getCollectorById, getCollectors } = require('../services/fileSystemService');
const matchingService = require('../services/matchingService');
const { translateAttributes, translateAttribute } = require('../utils/matchingTranslations');

// In-memory storage for auctions since we're not using MongoDB
let auctions = [];
let currentAuctionId = 1;

// Helper function to get all auctions
const getAllAuctions = async (req, res) => {
  res.json(auctions);
};

// Helper function to get auction by ID
const getAuctionById = async (req, res) => {
  const auction = auctions.find(a => a._id === req.params.id);
  if (auction) {
    res.json(auction);
  } else {
    res.status(404).json({ message: 'Auction not found' });
  }
};

// Create new auction
const createAuction = async (req, res) => {
  try {
    const { itemId, status } = req.body;
    
    // Check if item exists
    const item = getItemById(parseInt(itemId));
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const auction = {
      _id: (currentAuctionId++).toString(),
      itemId,
      status: status || 'pending',
      matchedDescriptions: [],
      totalValue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    auctions.push(auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new auction with a specific item
const createAuctionWithItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    // Get language preference from query parameter
    const language = req.query.lang || 'en';
    
    console.log(`[DEBUG] createAuctionWithItem called with itemId: ${itemId}, language: ${language}`);
    
    // Convert to integer
    const itemIdInt = parseInt(itemId);
    
    // Check if item exists
    const item = getItemById(itemIdInt, language);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Look for any existing active auction
    const existingAuction = auctions.find(a => a.status === 'active');
    
    if (existingAuction) {
      // Update existing auction with new item
      existingAuction.itemId = itemIdInt;
      existingAuction.matchedDescriptions = [];
      existingAuction.totalValue = 0;
      existingAuction.collectorId = undefined; // Clear previous collector
      existingAuction.updatedAt = new Date();
      
      console.log(`[DEBUG] Updated auction:`, existingAuction);
      
      res.json(existingAuction);
    } else {
      // Create new auction
      const newAuction = {
        _id: (currentAuctionId++).toString(),
        itemId: itemIdInt,
        status: 'active',
        matchedDescriptions: [],
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      auctions.push(newAuction);
      console.log(`[DEBUG] Created new auction:`, newAuction);
      
      res.json(newAuction);
    }
  } catch (error) {
    console.error('Error in createAuctionWithItem:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update auction
const updateAuction = async (req, res) => {
  try {
    const { itemId, collectorId, matchedDescriptions, totalValue, status } = req.body;
    
    const auctionIndex = auctions.findIndex(a => a._id === req.params.id);
    if (auctionIndex === -1) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const auction = auctions[auctionIndex];
    
    // Update fields if provided
    if (itemId) {
      const item = getItemById(parseInt(itemId));
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      auction.itemId = itemId;
    }
    
    if (collectorId) {
      const collector = getCollectorById(parseInt(collectorId));
      if (!collector) {
        return res.status(404).json({ message: 'Collector not found' });
      }
      auction.collectorId = collectorId;
    }
    
    if (matchedDescriptions) {
      auction.matchedDescriptions = matchedDescriptions;
    }
    
    if (totalValue !== undefined) {
      auction.totalValue = totalValue;
    }
    
    if (status) {
      auction.status = status;
    }
    
    auction.updatedAt = new Date();
    auctions[auctionIndex] = auction;
    
    res.json(auction);
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete auction
const deleteAuction = async (req, res) => {
  try {
    const auctionIndex = auctions.findIndex(a => a._id === req.params.id);
    if (auctionIndex === -1) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    auctions.splice(auctionIndex, 1);
    res.json({ message: 'Auction removed' });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({ message: error.message });
  }
};

// Match item with collector using the matrix-based matching service
const matchItemWithCollector = async (req, res) => {
  try {
    const { itemId, collectorId } = req.params;
    // Get language preference from query parameter
    const language = req.query.lang || 'en';
    
    console.log(`[DEBUG] matchItemWithCollector called with language: ${language}`);
    
    // Convert to integers
    const itemIdInt = parseInt(itemId);
    const collectorIdInt = parseInt(collectorId);
    
    // Check if item and collector exist
    const item = getItemById(itemIdInt, language);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const collector = getCollectorById(collectorIdInt, language);
    if (!collector) {
      return res.status(404).json({ message: 'Collector not found' });
    }
    
    // Get matching data from our matrix service
    const matchData = matchingService.getMatchingData(itemIdInt, collectorIdInt);
    console.log(`[DEBUG] Original attributes:`, matchData.attributes);
    
    // Test direct translation of a specific attribute
    const testAttribute = "Like oil paintings";
    const testTranslation = translateAttribute(testAttribute, language);
    console.log(`[DEBUG] Test translation of "${testAttribute}" to ${language}: "${testTranslation}"`);
    
    // Translate attributes to requested language
    const translatedAttributes = translateAttributes(matchData.attributes, language);
    console.log(`[DEBUG] Translated attributes (${language}):`, translatedAttributes);
    
    // Create format for matched descriptions that the frontend expects
    const matchedDescriptions = translatedAttributes.map(attr => {
      return {
        attribute: attr,
        value: 0  // We keep this for compatibility with frontend
      };
    });
    
    console.log('[DEBUG] Match data being sent to client:', { 
      language,
      attributes: translatedAttributes,
      matchedDescriptions,
      totalValue: matchData.value
    });
    
    // Create or update auction
    let auction = auctions.find(a => a.itemId === itemIdInt && a.status === 'active');
    
    if (!auction) {
      auction = {
        _id: (currentAuctionId++).toString(),
        itemId: itemIdInt,
        collectorId: collectorIdInt,
        matchedDescriptions,
        totalValue: matchData.value,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      auctions.push(auction);
    } else {
      auction.collectorId = collectorIdInt;
      auction.matchedDescriptions = matchedDescriptions;
      auction.totalValue = matchData.value;
      auction.updatedAt = new Date();
    }
    
    res.json({
      auction,
      matchedDescriptions,
      totalValue: matchData.value
    });
  } catch (error) {
    console.error('Error in matchItemWithCollector:', error);
    res.status(500).json({ message: error.message });
  }
};

// Match multiple items with collectors using the matrix matching service
const matchItems = async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'Please provide an array of item IDs' });
    }

    // Convert to integers
    const itemIdsInt = itemIds.map(id => parseInt(id));
    
    // Get all collectors
    const collectors = getCollectors();
    
    // Get items
    const items = itemIdsInt.map(id => getItemById(id)).filter(item => item !== null);

    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found' });
    }

    // For each collector, calculate matches with the selected items using our matrix service
    const matches = collectors.map(collector => {
      const collectorId = parseInt(collector.id);
      
      const matchedItems = items.map(item => {
        const itemId = parseInt(item.id);
        
        // Get matching data from our matrix
        const matchData = matchingService.getMatchingData(itemId, collectorId);
        
        // Only include if there's a value (non-zero match)
        if (matchData.value > 0) {
          // Create format for matched descriptions that the frontend expects
          const matchedDescriptions = matchData.attributes.map(attr => {
            return {
              attribute: attr,
              // We don't include individual attribute values in this implementation
              value: 0
            };
          });
          
          return {
            _id: item.id.toString(),
            name: item.name,
            matchedDescriptions,
            score: matchData.value
          };
        }
        
        return null;
      }).filter(match => match !== null); // Filter out null entries (no match)

      // Only include collectors with at least one match
      if (matchedItems.length > 0) {
        return {
          collector: {
            _id: collector.id.toString(),
            name: collector.name,
            image: collector.image
          },
          matchedItems
        };
      }
      
      return null;
    }).filter(match => match !== null); // Filter out null entries (no matches)

    res.json({ matches });
  } catch (error) {
    console.error('Error in matchItems:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get active auction
const getActiveAuction = async (req, res) => {
  try {
    console.log('Searching for active auction...');
    const auction = auctions.find(a => a.status === 'active');
    console.log('Found auction:', auction);
    
    if (auction) {
      res.json(auction);
    } else {
      // Let's create a new active auction if none exists
      const newAuction = {
        _id: (currentAuctionId++).toString(),
        itemId: 1, // Using first item as default
        status: 'active',
        matchedDescriptions: [],
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Creating new auction:', newAuction);
      auctions.push(newAuction);
      res.json(newAuction);
    }
  } catch (error) {
    console.error('Error in getActiveAuction:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuctions: getAllAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  matchItemWithCollector,
  getActiveAuction,
  matchItems,
  createAuctionWithItem
};
