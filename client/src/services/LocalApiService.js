// LocalApiService.js - A client-side API service that mimics server API behavior
// This service provides a way for components to communicate with each other

/**
 * A simple event-based API system that works entirely in the browser
 * Allows components to communicate without requiring internet connection
 */

// Define event names for better code organization
export const API_EVENTS = {
  AUCTION_CREATED: 'auction-created',
  AUCTION_UPDATED: 'auction-updated',
  AUCTION_DELETED: 'auction-deleted',
  ITEM_SELECTED: 'item-selected',
  COLLECTOR_SELECTED: 'collector-selected',
  MATCH_CREATED: 'match-created'
};

// Cache for current auction data to ensure it persists between page navigations
const STORAGE_KEYS = {
  CURRENT_AUCTION_ITEM: 'auction-current-item',
  SELECTED_ITEM: 'selected-item',
  SELECTED_COLLECTOR: 'selected-collector',
  ACTIVE_AUCTION: 'active-auction' // New key for active auction storage
};

// API Service with methods that mimic RESTful API operations
const LocalApiService = {
  // EVENT LISTENERS
  // Add event listener for API events
  addEventListener: (eventName, callback) => {
    window.addEventListener(eventName, callback);
    return () => window.removeEventListener(eventName, callback);
  },

  // Remove event listener for API events
  removeEventListener: (eventName, callback) => {
    window.removeEventListener(eventName, callback);
  },

  // ITEM METHODS
  // Select an item for auction
  selectItemForAuction: (itemId, language) => {
    console.debug(`[LocalApiService] Selecting item ${itemId} for auction`);
    
    // We don't clear the current auction anymore unless we're replacing it
    // with a new one, which we're doing below
    
    // Store the selected item
    localStorage.setItem(STORAGE_KEYS.SELECTED_ITEM, JSON.stringify({
      id: Number(itemId),
      language,
      timestamp: Date.now()
    }));
    
    // Store as the current auction item too
    localStorage.setItem(STORAGE_KEYS.CURRENT_AUCTION_ITEM, JSON.stringify({
      id: Number(itemId),
      language,
      timestamp: Date.now()
    }));
    
    // Also save as active auction 
    localStorage.setItem(STORAGE_KEYS.ACTIVE_AUCTION, JSON.stringify({
      itemId: Number(itemId),
      status: 'active',
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: Date.now().toString() // Simple ID generation
    }));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent(API_EVENTS.ITEM_SELECTED, {
      detail: { itemId: Number(itemId), language }
    }));
    
    return { success: true, itemId: Number(itemId) };
  },
  
  // Get the currently selected item
  getSelectedItem: () => {
    const item = localStorage.getItem(STORAGE_KEYS.SELECTED_ITEM);
    return item ? JSON.parse(item) : null;
  },
  
  // Get the current auction item
  getCurrentAuctionItem: () => {
    const item = localStorage.getItem(STORAGE_KEYS.CURRENT_AUCTION_ITEM);
    return item ? JSON.parse(item) : null;
  },
  
  // Get active auction 
  getActiveAuction: () => {
    const auction = localStorage.getItem(STORAGE_KEYS.ACTIVE_AUCTION);
    return auction ? JSON.parse(auction) : null;
  },
  
  // COLLECTOR METHODS
  // Select a collector for matching
  selectCollector: (collectorId, language) => {
    console.debug(`[LocalApiService] Selecting collector ${collectorId}`);
    
    // Store the selected collector
    localStorage.setItem(STORAGE_KEYS.SELECTED_COLLECTOR, JSON.stringify({
      id: Number(collectorId),
      language,
      timestamp: Date.now()
    }));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent(API_EVENTS.COLLECTOR_SELECTED, {
      detail: { collectorId: Number(collectorId), language }
    }));
    
    return { success: true, collectorId: Number(collectorId) };
  },
  
  // Get the currently selected collector
  getSelectedCollector: () => {
    const collector = localStorage.getItem(STORAGE_KEYS.SELECTED_COLLECTOR);
    return collector ? JSON.parse(collector) : null;
  },
  
  // AUCTION METHODS
  // Create a match between an item and collector
  createMatch: (itemId, collectorId, language) => {
    //console.debug(`[LocalApiService] Creating match between item ${itemId} and collector ${collectorId}`);
    
    const matchDetails = {
      itemId: Number(itemId),
      collectorId: Number(collectorId),
      language,
      timestamp: Date.now()
    };
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent(API_EVENTS.MATCH_CREATED, {
      detail: matchDetails
    }));
    
    return { success: true, ...matchDetails };
  },
  
  // Update active auction
  updateActiveAuction: (updates) => {
    const currentAuction = LocalApiService.getActiveAuction();
    if (currentAuction) {
      const updatedAuction = {
        ...currentAuction,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ACTIVE_AUCTION, JSON.stringify(updatedAuction));
      return { success: true, auction: updatedAuction };
    }
    return { success: false, error: 'No active auction found' };
  },
  
  // Clear current auction item - modified to not actually clear the data unless explicitly requested
  clearCurrentAuction: (forceRemove = false) => {
    if (forceRemove) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_AUCTION_ITEM);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_AUCTION);
    } else {
      // Instead of removing, mark as inactive but keep the item
      const currentAuction = LocalApiService.getActiveAuction();
      if (currentAuction) {
        currentAuction.status = 'inactive';
        currentAuction.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ACTIVE_AUCTION, JSON.stringify(currentAuction));
      }
    }
    return { success: true };
  }
};

export default LocalApiService;