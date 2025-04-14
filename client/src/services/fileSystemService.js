// File system service for client-side
// This service handles loading collector and item data directly from the server API

/**
 * Get all collectors from the filesystem
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Array>} Promise resolving to array of collector objects
 */
export const getCollectors = async (lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/collectors${langParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch collectors');
    }
    const data = await response.json();
    return data;
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
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/collectors/${id}${langParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch collector');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching collector ${id}:`, error);
    throw error;
  }
};

/**
 * Get all items from the filesystem
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Array>} Promise resolving to array of item objects
 */
export const getItems = async (lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/items${langParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    const data = await response.json();
    return data;
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
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/items/${id}${langParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw error;
  }
};

/**
 * Match item with collector
 * @param {Number} itemId Item ID
 * @param {Number} collectorId Collector ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to match result
 */
export const matchItemWithCollector = async (itemId, collectorId, lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auctions/match/${itemId}/${collectorId}${langParam}`, 
      { method: 'POST' }
    );
    if (!response.ok) {
      throw new Error('Failed to match item with collector');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error matching item ${itemId} with collector ${collectorId}:`, error);
    throw error;
  }
};

/**
 * Get active auction
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to active auction
 */
export const getActiveAuction = async (lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/active${langParam}`);
    if (!response.ok) {
      throw new Error('Failed to fetch active auction');
    }
    const data = await response.json();
    return data;
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
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}${langParam}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionData),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update auction');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating auction ${auctionId}:`, error);
    throw error;
  }
};

/**
 * Update item customization (title and description)
 * @param {Number} itemId Item ID
 * @param {Object} customData Custom title and description data
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to updated item
 */
export const updateItemCustomization = async (itemId, customData, lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/items/customize/${itemId}${langParam}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customData),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update item customization');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating item customization ${itemId}:`, error);
    throw error;
  }
};

/**
 * Update collector customization (title and description)
 * @param {Number} collectorId Collector ID
 * @param {Object} customData Custom title and description data
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Promise<Object>} Promise resolving to updated collector
 */
export const updateCollectorCustomization = async (collectorId, customData, lang = null) => {
  try {
    const langParam = lang ? `?lang=${lang}` : '';
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/collectors/customize/${collectorId}${langParam}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customData),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update collector customization');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating collector customization ${collectorId}:`, error);
    throw error;
  }
};