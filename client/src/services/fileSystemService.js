// File system service for client-side
// This service handles loading collector and item data directly from the server API

/**
 * Get all collectors from the filesystem
 * @returns {Promise<Array>} Promise resolving to array of collector objects
 */
export const getCollectors = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/collectors`);
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
 * @returns {Promise<Object>} Promise resolving to collector object
 */
export const getCollectorById = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/collectors/${id}`);
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
 * @returns {Promise<Array>} Promise resolving to array of item objects
 */
export const getItems = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/items`);
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
 * @returns {Promise<Object>} Promise resolving to item object
 */
export const getItemById = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
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
 * @returns {Promise<Object>} Promise resolving to match result
 */
export const matchItemWithCollector = async (itemId, collectorId) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auctions/match/${itemId}/${collectorId}`, 
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
 * @returns {Promise<Object>} Promise resolving to active auction
 */
export const getActiveAuction = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/active`);
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
 * @returns {Promise<Object>} Promise resolving to updated auction
 */
export const updateAuction = async (auctionId, auctionData) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}`,
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