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
  SELECTED_COLLECTOR: 'selected-collector'
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
    
    // Clear any existing auctions first to ensure complete replacement
    LocalApiService.clearCurrentAuction();
    
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
  
  // Clear current auction item
  clearCurrentAuction: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_AUCTION_ITEM);
    return { success: true };
  }
};

export default LocalApiService;