/**
 * Matrix-based matching service for items and collectors
 * This service provides a matrix that matches each item (1-72) with each collector (1-30)
 * and returns specific values and matching attributes for each combination.
 */

// Matrix for storing item-collector matches
// Format: matchingMatrix[itemId][collectorId] = { value: integer, attributes: string[] }
const matchingMatrix = {};

// Initialize empty matrix for all combinations
function initializeMatchingMatrix() {
  // Initialize matrix for all 72 items
  for (let itemId = 1; itemId <= 72; itemId++) {
    matchingMatrix[itemId] = {};
    
    // Initialize entries for all 30 collectors
    for (let collectorId = 1; collectorId <= 30; collectorId++) {
      // Default is no match (0 value and empty attributes array)
      matchingMatrix[itemId][collectorId] = {
        value: 0,
        attributes: []
      };
    }
  }

  // Populate the matrix with sample matching data
  // These are examples - you should replace with your own data later
  
  // Item 1 (Illustration Item) matches
  matchingMatrix[1][1] = {
    value: 9,
    attributes: [
      "Like oil paintings."
    ]
  };
  
  matchingMatrix[1][2] = {
    value: 43,
    attributes: [
      "Like paintings with female subjects.",
      "Like American works.",
      "Like landscape paintings.",
      "Like oil paintings"
    ]
  };
  
  matchingMatrix[1][3] = {
    value: 19,
    attributes: [
      "Like American works."
    ]
  };

  matchingMatrix[1][4] = {
    value: 37,
    attributes: [
      "Like 20th century works.",
      "Like landscape paintings.",
      "Like paintings describe human emotion."
    ]
  };

  matchingMatrix[1][5] = {
    value: 28,
    attributes: [
      "Like works in modern.",
      "Like American works."
    ]
  };

  matchingMatrix[1][6] = {
    value: 9,
    attributes: [
      "Like oil paintings."
    ]
  };

  matchingMatrix[1][7] = {
    value: 43,
    attributes: [
      "Like paintings with female subjects",
      "Like American works.",
      "Like landscape paintings.",
      "Like oil paintings"
    ]
  };

  matchingMatrix[1][8] = {
    value: 19,
    attributes: [
      "Like American works.",
    ]
  };

  matchingMatrix[1][9] = {
    value: 37,
    attributes: [
      "Like 20th century works.",
      "Like landscape paintings.",
      "Like paintings describe human emotion."
    ]
  };

  matchingMatrix[1][10] = {
    value: 9,
    attributes: [
      "Like paintings describe human emotion."
    ]
  };

  // Item 2 (Illustration Item) matches
  matchingMatrix[2][1] = {
    value: 20,
    attributes: [
      "Similar artistic movement",
      "Both depict natural scenery"
    ]
  };
  
  matchingMatrix[2][5] = {
    value: 30,
    attributes: [
      "Similar color palette",
      "Both symbolize freedom",
      "Both highly valued in market"
    ]
  };
  
  // Item 3 (Illustration Item) matches
  matchingMatrix[3][2] = {
    value: 22,
    attributes: [
      "Both demonstrate impressionist style",
      "Similar emotional tone",
      "Same cultural origin"
    ]
  };
  
  // Item 25 (Sculpture Item) matches
  matchingMatrix[25][21] = {
    value: 28,
    attributes: [
      "Both feature marble material",
      "Classical style elements",
      "Similar historical significance"
    ]
  };
  
  // Item 49 (Product Item) matches
  matchingMatrix[49][11] = {
    value: 32,
    attributes: [
      "Similar functional design",
      "Both utilize modern materials",
      "Contemporary aesthetic"
    ]
  };
  
  // Add many more combinations as needed
  // You can add thousands of match combinations following this pattern
}

// Initialize the matrix when module loads
initializeMatchingMatrix();

/**
 * Get matching data between an item and collector
 * @param {number} itemId - Item ID (1-72)
 * @param {number} collectorId - Collector ID (1-30)
 * @returns {Object} Matching data with value and attributes
 */
export function getMatchingData(itemId, collectorId) {
  // Ensure IDs are within valid range
  if (itemId < 1 || itemId > 72 || collectorId < 1 || collectorId > 30) {
    return { value: 0, attributes: [] };
  }
  
  // Return matching data from the matrix
  return matchingMatrix[itemId][collectorId] || { value: 0, attributes: [] };
}

/**
 * Set matching data between an item and collector
 * @param {number} itemId - Item ID (1-72)
 * @param {number} collectorId - Collector ID (1-30)
 * @param {number} value - Matching value (integer)
 * @param {string[]} attributes - Array of matching attribute strings
 */
export function setMatchingData(itemId, collectorId, value, attributes) {
  // Ensure IDs are within valid range
  if (itemId < 1 || itemId > 72 || collectorId < 1 || collectorId > 30) {
    throw new Error("Invalid item or collector ID");
  }
  
  // Ensure value is a number
  if (typeof value !== 'number') {
    value = parseInt(value) || 0;
  }
  
  // Ensure attributes is an array
  if (!Array.isArray(attributes)) {
    attributes = [];
  }
  
  // Initialize the matrix entry if it doesn't exist
  if (!matchingMatrix[itemId]) {
    matchingMatrix[itemId] = {};
  }
  
  // Set the matching data
  matchingMatrix[itemId][collectorId] = {
    value,
    attributes
  };
}

/**
 * Get all matches for a specific item
 * @param {number} itemId - Item ID (1-72)
 * @returns {Object} Object with collector IDs as keys and matching data as values
 */
export function getItemMatches(itemId) {
  if (itemId < 1 || itemId > 72) {
    return {};
  }
  
  return matchingMatrix[itemId] || {};
}

/**
 * Get all matches for a specific collector
 * @param {number} collectorId - Collector ID (1-30)
 * @returns {Object} Object with item IDs as keys and matching data as values
 */
export function getCollectorMatches(collectorId) {
  if (collectorId < 1 || collectorId > 30) {
    return {};
  }
  
  const result = {};
  
  // Loop through all items and find matches for this collector
  for (let itemId = 1; itemId <= 72; itemId++) {
    if (matchingMatrix[itemId] && matchingMatrix[itemId][collectorId]) {
      result[itemId] = matchingMatrix[itemId][collectorId];
    }
  }
  
  return result;
}

/**
 * Get the entire matching matrix
 * @returns {Object} The complete matching matrix
 */
export function getFullMatchingMatrix() {
  return matchingMatrix;
}

// Export the initialization function
export function reinitializeMatchingMatrix() {
  // Clear the current matrix
  Object.keys(matchingMatrix).forEach(key => delete matchingMatrix[key]);
  
  // Reinitialize
  initializeMatchingMatrix();
  
  return matchingMatrix;
}