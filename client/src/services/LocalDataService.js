// LocalDataService.js - A client-side replacement for MongoDB
// This service provides access to all game data using browser storage

// Import the static data
import itemData from '../data/item-customization.json';
import collectorData from '../data/collector-customization.json';

// Use localStorage to persist game state between sessions
const STORAGE_KEYS = {
  ITEMS: 'art-card-game-items',
  COLLECTORS: 'art-card-game-collectors',
  AUCTIONS: 'art-card-game-auctions',
  GAME_STATE: 'art-card-game-state'
};

// Initialize the data store with default data
const initializeDataIfNeeded = () => {
  // Check if items exist in localStorage, otherwise use default data
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(itemData));
  }
  
  // Check if collectors exist in localStorage, otherwise use default data
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTORS)) {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectorData));
  }
  
  // Check if auctions exist in localStorage, otherwise use empty array
  if (!localStorage.getItem(STORAGE_KEYS.AUCTIONS)) {
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify([]));
  }
  
  // Check if game state exists in localStorage, otherwise use default state
  if (!localStorage.getItem(STORAGE_KEYS.GAME_STATE)) {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify({
      currentGame: null,
      language: 'en',
      settings: {
        sound: true,
        animations: true
      }
    }));
  }
};

// Initialize when the service is first loaded
initializeDataIfNeeded();

// Item-related methods
const itemService = {
  // Get all items
  getAllItems: () => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS));
    return Object.entries(items).map(([id, item]) => ({
      id,
      ...item
    }));
  },
  
  // Get item by id
  getItemById: (id) => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS));
    return items[id] ? { id, ...items[id] } : null;
  },
  
  // Update an item
  updateItem: (id, updatedItem) => {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS));
    items[id] = { ...items[id], ...updatedItem };
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return { id, ...items[id] };
  }
};

// Collector-related methods
const collectorService = {
  // Get all collectors
  getAllCollectors: () => {
    const collectors = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLECTORS));
    return Object.entries(collectors).map(([id, collector]) => ({
      id,
      ...collector
    }));
  },
  
  // Get collector by id
  getCollectorById: (id) => {
    const collectors = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLECTORS));
    return collectors[id] ? { id, ...collectors[id] } : null;
  },
  
  // Update a collector
  updateCollector: (id, updatedCollector) => {
    const collectors = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLECTORS));
    collectors[id] = { ...collectors[id], ...updatedCollector };
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
    return { id, ...collectors[id] };
  },
  
  // Reset collectors to initial data
  resetCollectors: () => {
    // Import the collector data directly
    // Note: In a real implementation, you might want to use a dynamic import here
    const collectors = collectorData;
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
    return Object.entries(collectors).map(([id, collector]) => ({
      id,
      ...collector
    }));
  }
};

// Auction-related methods
const auctionService = {
  // Get all auctions
  getAllAuctions: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUCTIONS));
  },
  
  // Create a new auction
  createAuction: (auction) => {
    const auctions = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUCTIONS));
    const newAuction = {
      ...auction,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString()
    };
    auctions.push(newAuction);
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
    return newAuction;
  },
  
  // Update an auction
  updateAuction: (id, updatedAuction) => {
    const auctions = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUCTIONS));
    const index = auctions.findIndex(a => a.id === id);
    if (index !== -1) {
      auctions[index] = { ...auctions[index], ...updatedAuction };
      localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
      return auctions[index];
    }
    return null;
  }
};

// Game state methods
const gameStateService = {
  // Get the current game state
  getGameState: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE));
  },
  
  // Update the game state
  updateGameState: (newState) => {
    const currentState = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE));
    const updatedState = { ...currentState, ...newState };
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(updatedState));
    return updatedState;
  },
  
  // Reset the game to initial state
  resetGame: () => {
    localStorage.clear();
    initializeDataIfNeeded();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_STATE));
  }
};

// Export all services
const LocalDataService = {
  items: itemService,
  collectors: collectorService,
  auctions: auctionService,
  gameState: gameStateService
};

export default LocalDataService;