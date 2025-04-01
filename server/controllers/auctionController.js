const Auction = require('../models/auctionModel');
const Item = require('../models/itemModel');
const Collector = require('../models/collectorModel');

// Get all auctions
const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({});
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get auction by ID
const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
      res.json(auction);
    } else {
      res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new auction
const createAuction = async (req, res) => {
  try {
    const { itemId, status } = req.body;
    
    // Check if item exists
    const item = await Item.findOne({ id: itemId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const auction = new Auction({
      itemId,
      status: status || 'pending',
      matchedDescriptions: [],
      totalValue: 0
    });
    
    const createdAuction = await auction.save();
    res.status(201).json(createdAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update auction
const updateAuction = async (req, res) => {
  try {
    const { itemId, collectorId, matchedDescriptions, totalValue, status } = req.body;
    
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    // Update fields if provided
    if (itemId) {
      const item = await Item.findOne({ id: itemId });
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      auction.itemId = itemId;
    }
    
    if (collectorId) {
      const collector = await Collector.findOne({ id: collectorId });
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
    
    const updatedAuction = await auction.save();
    res.json(updatedAuction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete auction
const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    await auction.remove();
    res.json({ message: 'Auction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Match item with collector
const matchItemWithCollector = async (req, res) => {
  try {
    const { itemId, collectorId } = req.params;
    
    // Check if item and collector exist
    const item = await Item.findOne({ id: itemId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const collector = await Collector.findOne({ id: collectorId });
    if (!collector) {
      return res.status(404).json({ message: 'Collector not found' });
    }
    
    // Find matching descriptions
    const matchedDescriptions = [];
    let totalValue = 0;
    
    // Compare each description in the collector with each description in the item
    collector.descriptions.forEach(collectorDesc => {
      item.descriptions.forEach(itemDesc => {
        if (collectorDesc.attribute === itemDesc.attribute) {
          matchedDescriptions.push({
            attribute: collectorDesc.attribute,
            value: collectorDesc.value
          });
          totalValue += collectorDesc.value;
        }
      });
    });
    
    // Create or update auction
    let auction = await Auction.findOne({ 
      itemId: itemId,
      status: 'active'
    });
    
    if (!auction) {
      auction = new Auction({
        itemId,
        collectorId,
        matchedDescriptions,
        totalValue,
        status: 'active'
      });
    } else {
      auction.collectorId = collectorId;
      auction.matchedDescriptions = matchedDescriptions;
      auction.totalValue = totalValue;
    }
    
    const savedAuction = await auction.save();
    res.json({
      auction: savedAuction,
      matchedDescriptions,
      totalValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active auction
const getActiveAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: 'active' });
    if (auction) {
      res.json(auction);
    } else {
      res.status(404).json({ message: 'No active auction found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  matchItemWithCollector,
  getActiveAuction
};
