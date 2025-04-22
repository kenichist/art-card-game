// fileSystemService.js - Offline version that uses LocalDataService instead of API calls

import LocalDataService from './LocalDataService';

// Helper function to add delay to simulate async behavior (can be removed in production)
const addDelay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for image path construction
const getImagePath = (type, id, language = 'en') => {
  language = language || 'en'; // Default to English if not specified
  
  //console.log(`Constructing image path for ${type} with id ${id} and language ${language}`);
  
  // Simplified path construction that matches your actual folder structure
  const path = `/images/${type}s/${language}/${id}.jpg`;
  //console.log(`Constructed path: ${path}`);
  return path;
};

/**
 * Get all collectors
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Array>} Promise resolving to array of collector objects
 */
export const getCollectors = async (lang = null) => {
  try {
    await addDelay();
    const collectors = LocalDataService.collectors.getAllCollectors();
    
    // Add image paths based on language
    return collectors.map(collector => ({
      ...collector,
      image: getImagePath('collector', collector.id, lang),
      name: lang === 'zh' ? collector.title_zh || `收藏家 ${collector.id}` : collector.title_en || `Collector ${collector.id}`,
      description: lang === 'zh' ? collector.description_zh : collector.description_en
    }));
  } catch (error) {
    console.error('Error fetching collectors:', error);
    throw error;
  }
};

/**
 * Get collector by ID
 * @param {Number} id Collector ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to collector object
 */
export const getCollectorById = async (id, lang = null) => {
  try {
    await addDelay();
    const collector = LocalDataService.collectors.getCollectorById(id);
    
    if (!collector) {
      throw new Error('Collector not found');
    }
    
    return {
      ...collector,
      image: getImagePath('collector', collector.id, lang),
      name: lang === 'zh' ? collector.title_zh || `收藏家 ${collector.id}` : collector.title_en || `Collector ${collector.id}`,
      description: lang === 'zh' ? collector.description_zh : collector.description_en
    };
  } catch (error) {
    console.error(`Error fetching collector ${id}:`, error);
    throw error;
  }
};

/**
 * Get all items
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Array>} Promise resolving to array of item objects
 */
export const getItems = async (lang = null) => {
  try {
    await addDelay();
    const items = LocalDataService.items.getAllItems();
    
    // Add image paths based on language
    return items.map(item => ({
      ...item,
      image: getImagePath('item', item.id, lang),
      name: lang === 'zh' ? item.title_zh || `物品 ${item.id}` : item.title_en || `Item ${item.id}`,
      description: lang === 'zh' ? item.description_zh : item.description_en
    }));
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

/**
 * Get item by ID
 * @param {Number} id Item ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to item object
 */
export const getItemById = async (id, lang = null) => {
  try {
    await addDelay();
    const item = LocalDataService.items.getItemById(id);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    return {
      ...item,
      image: getImagePath('item', item.id, lang),
      name: lang === 'zh' ? item.title_zh || `物品 ${item.id}` : item.title_en || `Item ${item.id}`,
      description: lang === 'zh' ? item.description_zh : item.description_en
    };
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

/**
 * Set an item for auction
 * @param {Number} itemId Item ID to use in auction
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to auction object
 */
export const setItemForAuction = async (itemId, lang = null) => {
  try {
    await addDelay();
    
    // Get the item
    const item = await getItemById(itemId, lang);
    
    // Convert itemId to number to ensure consistent comparison
    const numericItemId = Number(itemId);
    
    // Clear any existing active auctions first
    const allAuctions = LocalDataService.auctions.getAllAuctions();
    const activeAuctions = allAuctions.filter(a => a.status === 'active');
    
    console.debug(`[setItemForAuction] Found ${activeAuctions.length} active auctions before creating new one`);
    
    // Mark all active auctions as completed
    for (const auction of activeAuctions) {
      console.debug(`[setItemForAuction] Marking auction ${auction.id} with item ${auction.itemId} as completed`);
      LocalDataService.auctions.updateAuction(auction.id, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    }
    
    // Create a new auction with this item
    const auction = LocalDataService.auctions.createAuction({
      itemId: numericItemId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.debug(`[setItemForAuction] Created new auction with ID ${auction.id} for item ${numericItemId}`);
    
    return auction;
  } catch (error) {
    console.error(`Error setting item ${itemId} for auction:`, error);
    throw error;
  }
};

/**
 * Match item with collector
 * @param {Number} itemId Item ID
 * @param {Number} collectorId Collector ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to match results
 */
export const matchItemWithCollector = async (itemId, collectorId, lang = null) => {
  try {
    await addDelay();
    
    // Import here to avoid circular dependencies
    const { getMatchingData } = await import('./matchingService');
    
    const numericItemId = Number(itemId);
    const numericCollectorId = Number(collectorId);
    
    console.debug('[matchItemWithCollector] Starting matching process:', { 
      itemId: numericItemId, 
      collectorId: numericCollectorId, 
      lang 
    });
    
    // Get match data from our matrix service
    const matchData = getMatchingData(numericItemId, numericCollectorId);
    
    // Create matched descriptions from the attributes
    const matchedDescriptions = matchData.attributes.map(attr => {
      return {
        attribute: lang === 'zh' ? translateAttributeToZh(attr) : attr,
        value: 0 // We don't track individual values in this implementation
      };
    });
    
    // Get all auctions and find the active one
    const auctions = LocalDataService.auctions.getAllAuctions();
    console.debug('[matchItemWithCollector] All auctions:', auctions);
    
    // First try to find an auction with matching itemId
    let activeAuction = auctions.find(a => a.itemId === numericItemId && a.status === 'active');
    
    // If no matching auction found, try any active auction
    if (!activeAuction) {
      console.debug('[matchItemWithCollector] No exact matching auction found. Looking for any active auction.');
      activeAuction = auctions.find(a => a.status === 'active');
    }
    
    // If still no auction found, create a new one
    if (!activeAuction) {
      console.debug('[matchItemWithCollector] No active auction found. Creating a new one for itemId:', numericItemId);
      activeAuction = LocalDataService.auctions.createAuction({
        itemId: numericItemId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      console.debug('[matchItemWithCollector] Found active auction:', activeAuction);
    }
    
    // Update the auction with match data
    LocalDataService.auctions.updateAuction(activeAuction.id, {
      itemId: numericItemId, // Ensure the itemId is updated to match the one being bid on
      collectorId: numericCollectorId,
      matchedDescriptions,
      totalValue: matchData.value,
      updatedAt: new Date().toISOString()
    });
    
    return {
      auction: {
        ...activeAuction,
        _id: activeAuction.id, // For compatibility with existing code
        itemId: numericItemId, // Ensure the itemId is correct in the returned data
        collectorId: numericCollectorId
      },
      matchedDescriptions,
      totalValue: matchData.value
    };
  } catch (error) {
    console.error(`Error matching item ${itemId} with collector ${collectorId}:`, error);
    throw error;
  }
};

// Simple attribute translation function
// In a real application, this would be more comprehensive
const translateAttributeToZh = (englishAttribute) => {
  const translations = {
    "Like oil paintings": "喜欢油画",
    "Similar color palette": "相似的色彩调色板",
    "Both feature female subjects": "都以女性为主题",
    "Both demonstrate similar composition": "展示相似的构图",
    "Created in the same period": "在同一时期创作",
    "Similar artistic movement": "相似的艺术运动",
    "Both depict natural scenery": "都描绘自然景观",
    "Both symbolize freedom": "都象征自由",
    "Both highly valued in market": "市场价值都很高",
    "Both demonstrate impressionist style": "都展示印象派风格",
    "Similar emotional tone": "情感基调相似",
    "Same cultural origin": "相同的文化来源",
    "Both feature marble material": "都采用大理石材质",
    "Classical style elements": "古典风格元素",
    "Similar historical significance": "相似的历史意义",
    "Similar functional design": "相似的功能设计",
    "Both utilize modern materials": "都使用现代材料",
    "Contemporary aesthetic": "当代美学"
  };
  
  return translations[englishAttribute] || englishAttribute;
};

/**
 * Get active auction
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to active auction
 */
export const getActiveAuction = async (lang = null) => {
  try {
    await addDelay();
    const auctions = LocalDataService.auctions.getAllAuctions();
    const activeAuction = auctions.find(a => a.status === 'active');
    
    if (!activeAuction) {
      // Create a default auction if none exists (optional)
      return null;
    }
    
    return {
      ...activeAuction,
      _id: activeAuction.id // For compatibility with existing code
    };
  } catch (error) {
    console.error('Error fetching active auction:', error);
    throw error;
  }
};

/**
 * Update auction
 * @param {String} auctionId Auction ID
 * @param {Object} auctionData Auction data
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to updated auction
 */
export const updateAuction = async (auctionId, auctionData, lang = null) => {
  try {
    await addDelay();
    const updatedAuction = LocalDataService.auctions.updateAuction(auctionId, {
      ...auctionData,
      updatedAt: new Date().toISOString()
    });
    
    if (!updatedAuction) {
      throw new Error('Failed to update auction');
    }
    
    return {
      ...updatedAuction,
      _id: updatedAuction.id // For compatibility with existing code
    };
  } catch (error) {
    console.error(`Error updating auction ${auctionId}:`, error);
    throw error;
  }
};

/**
 * Update item customization
 * @param {Number} itemId Item ID
 * @param {Object} customData Custom title and description data
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to updated item
 */
export const updateItemCustomization = async (itemId, customData, lang = null) => {
  try {
    await addDelay();
    const item = LocalDataService.items.getItemById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    // Update based on language
    const updates = {};
    if (customData.titleEn) updates.title_en = customData.titleEn;
    if (customData.titleZh) updates.title_zh = customData.titleZh;
    if (customData.descriptionEn) updates.description_en = customData.descriptionEn;
    if (customData.descriptionZh) updates.description_zh = customData.descriptionZh;
    
    const updatedItem = LocalDataService.items.updateItem(itemId, updates);
    
    return {
      ...updatedItem,
      image: getImagePath('item', updatedItem.id, lang),
      name: lang === 'zh' ? updatedItem.title_zh : updatedItem.title_en,
      description: lang === 'zh' ? updatedItem.description_zh : updatedItem.description_en
    };
  } catch (error) {
    console.error(`Error updating item customization ${itemId}:`, error);
    throw error;
  }
};

/**
 * Update collector customization
 * @param {Number} collectorId Collector ID
 * @param {Object} customData Custom title and description data
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to updated collector
 */
export const updateCollectorCustomization = async (collectorId, customData, lang = null) => {
  try {
    await addDelay();
    const collector = LocalDataService.collectors.getCollectorById(collectorId);
    
    if (!collector) {
      throw new Error('Collector not found');
    }
    
    // Update based on language
    const updates = {};
    if (customData.titleEn) updates.title_en = customData.titleEn;
    if (customData.titleZh) updates.title_zh = customData.titleZh;
    if (customData.descriptionEn) updates.description_en = customData.descriptionEn;
    if (customData.descriptionZh) updates.description_zh = customData.descriptionZh;
    
    const updatedCollector = LocalDataService.collectors.updateCollector(collectorId, updates);
    
    return {
      ...updatedCollector,
      image: getImagePath('collector', updatedCollector.id, lang),
      name: lang === 'zh' ? updatedCollector.title_zh : updatedCollector.title_en,
      description: lang === 'zh' ? updatedCollector.description_zh : updatedCollector.description_en
    };
  } catch (error) {
    console.error(`Error updating collector customization ${collectorId}:`, error);
    throw error;
  }
};