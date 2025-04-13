const fs = require('fs');
const path = require('path');

// Updated paths to match where you moved the images
const collectorsPath = path.join(__dirname, '../../client/public/images/collectors');
const itemsPath = path.join(__dirname, '../../client/public/images/items');

/**
 * Get all collectors from the filesystem
 * @returns {Array} Array of collector objects
 */
const getCollectors = () => {
  try {
    const files = fs.readdirSync(collectorsPath);
    
    const collectors = files
      .filter(file => {
        // Filter for collector files that match i1-i10, p1-p10, s1-s10
        return /^[ips][1-9]0?\.jpg$/i.test(file);
      })
      .map(file => {
        const id = parseInt(file.substring(1).split('.')[0]);
        const type = file.charAt(0).toLowerCase() === 'i' ? 'Illustration' :
                    file.charAt(0).toLowerCase() === 'p' ? 'Product' : 'Sculpture';
        
        return {
          id: getCollectorId(file),
          name: `${type} Collector ${id}`,
          // Updated to use the correct URL path
          image: `/images/collectors/${file}`,
          originalPath: path.join(collectorsPath, file)
        };
      });
    
    return collectors;
  } catch (error) {
    console.error('Error reading collectors directory:', error);
    return [];
  }
};

/**
 * Get collector ID from filename (i1.jpg -> 1, p10.jpg -> 10, etc.)
 */
const getCollectorId = (filename) => {
  // Extract the type (i, p, s) and number
  const match = filename.match(/^([ips])(\d+)\.jpg$/i);
  if (!match) return 0;
  
  const type = match[1].toLowerCase();
  const number = parseInt(match[2]);
  
  // Map to ID ranges:
  // i1-i10: 1-10
  // p1-p10: 11-20
  // s1-s10: 21-30
  if (type === 'i') {
    return number;
  } else if (type === 'p') {
    return number + 10;
  } else if (type === 's') {
    return number + 20;
  }
  
  return 0;
};

/**
 * Get all items from the filesystem
 * @returns {Array} Array of item objects
 */
const getItems = () => {
  try {
    const files = fs.readdirSync(itemsPath);
    
    const items = files
      .filter(file => {
        // Filter for item files that are numbered 1-72.jpg
        return /^[1-9][0-9]?\.jpg$|^[1-7][0-2]\.jpg$/.test(file);
      })
      .map(file => {
        const id = parseInt(file.split('.')[0]);
        let type = 'Unknown';
        
        if (id >= 1 && id <= 24) {
          type = 'Illustration';
        } else if (id >= 25 && id <= 48) {
          type = 'Sculpture';
        } else if (id >= 49 && id <= 72) {
          type = 'Product';
        }
        
        return {
          id,
          name: `${type} Item ${id}`,
          // Updated to use the correct URL path
          image: `/images/items/${file}`,
          originalPath: path.join(itemsPath, file)
        };
      });
    
    return items;
  } catch (error) {
    console.error('Error reading items directory:', error);
    return [];
  }
};

/**
 * Get a collector by ID
 * @param {Number} id Collector ID
 * @returns {Object|null} Collector object or null if not found
 */
const getCollectorById = (id) => {
  const collectors = getCollectors();
  return collectors.find(collector => collector.id === parseInt(id)) || null;
};

/**
 * Get an item by ID
 * @param {Number} id Item ID
 * @returns {Object|null} Item object or null if not found
 */
const getItemById = (id) => {
  const items = getItems();
  return items.find(item => item.id === parseInt(id)) || null;
};

/**
 * Ensure the public image directories exist and copy images if needed
 */
const ensurePublicDirectories = () => {
  const publicCollectorsPath = path.join(__dirname, '../public/images/collectors');
  const publicItemsPath = path.join(__dirname, '../public/images/items');
  
  // Create directories if they don't exist
  if (!fs.existsSync(publicCollectorsPath)) {
    fs.mkdirSync(publicCollectorsPath, { recursive: true });
  }
  
  if (!fs.existsSync(publicItemsPath)) {
    fs.mkdirSync(publicItemsPath, { recursive: true });
  }
  
  try {
    // Instead of using getCollectors(), which might fail if files are missing,
    // read directly from the directory
    const collectorFiles = fs.readdirSync(collectorsPath);
    collectorFiles.forEach(file => {
      if (/^[ips][1-9]0?\.jpg$/i.test(file)) {
        const sourcePath = path.join(collectorsPath, file);
        const destPath = path.join(publicCollectorsPath, file);
        if (!fs.existsSync(destPath) && fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    });
    
    // Same for item images
    const itemFiles = fs.readdirSync(itemsPath);
    itemFiles.forEach(file => {
      if (/^[1-9][0-9]?\.jpg$|^[1-7][0-2]\.jpg$/.test(file)) {
        const sourcePath = path.join(itemsPath, file);
        const destPath = path.join(publicItemsPath, file);
        if (!fs.existsSync(destPath) && fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    });
    
    console.log('Public directories ensured and images copied successfully');
  } catch (error) {
    console.error('Error in ensurePublicDirectories:', error);
    // Continue execution even if there's an error
  }
};

module.exports = {
  getCollectors,
  getItems,
  getCollectorById,
  getItemById,
  ensurePublicDirectories
};