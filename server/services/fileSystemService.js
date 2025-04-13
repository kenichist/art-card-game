const fs = require('fs');
const path = require('path');

// Updated paths to match where you moved the images
const baseCollectorsPath = path.join(__dirname, '../../client/public/images/collectors');
const baseItemsPath = path.join(__dirname, '../../client/public/images/items');

/**
 * Get all collectors from the filesystem with language support
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Array} Array of collector objects
 */
const getCollectors = (lang = 'en') => {
  try {
    // Use the language-specific folders
    const collectorsPath = path.join(baseCollectorsPath, lang);
    
    // Fallback to base folder if language folder doesn't exist
    const folderToUse = fs.existsSync(collectorsPath) ? collectorsPath : baseCollectorsPath;
    
    const files = fs.readdirSync(folderToUse);
    
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
          // Updated to use the language-specific path
          image: `/images/collectors/${lang}/${file}`,
          originalPath: path.join(folderToUse, file),
          language: lang
        };
      });
    
    return collectors;
  } catch (error) {
    console.error(`Error reading collectors directory for language ${lang}:`, error);
    return [];
  }
};

/**
 * Get collector ID from filename (i1.jpg -> 1, p10.jpg -> 10, etc.)
 */
const getCollectorId = (filename) => {
  const match = filename.match(/^([ips])(\d+)\.jpg$/i);
  if (!match) return 0;
  
  const type = match[1].toLowerCase();
  const number = parseInt(match[2]);
  
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
 * Get all items from the filesystem with language support
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Array} Array of item objects
 */
const getItems = (lang = 'en') => {
  try {
    // Use the language-specific folders
    const itemsPath = path.join(baseItemsPath, lang);
    
    // Fallback to base folder if language folder doesn't exist
    const folderToUse = fs.existsSync(itemsPath) ? itemsPath : baseItemsPath;
    
    const files = fs.readdirSync(folderToUse);
    
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
          // Updated to use the language-specific path
          image: `/images/items/${lang}/${file}`,
          originalPath: path.join(folderToUse, file),
          language: lang
        };
      });
    
    return items;
  } catch (error) {
    console.error(`Error reading items directory for language ${lang}:`, error);
    return [];
  }
};

/**
 * Get a collector by ID with language support
 * @param {Number} id Collector ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Object|null} Collector object or null if not found
 */
const getCollectorById = (id, lang = 'en') => {
  const collectors = getCollectors(lang);
  return collectors.find(collector => collector.id === parseInt(id)) || null;
};

/**
 * Get an item by ID with language support
 * @param {Number} id Item ID
 * @param {String} lang Language code ('en' or 'zh')
 * @returns {Object|null} Item object or null if not found
 */
const getItemById = (id, lang = 'en') => {
  const items = getItems(lang);
  return items.find(item => item.id === parseInt(id)) || null;
};

/**
 * Ensure the public image directories exist and copy images for language support
 */
const ensurePublicDirectories = () => {
  const languages = ['en', 'zh'];
  
  languages.forEach(lang => {
    const publicCollectorsPath = path.join(__dirname, '../public/images/collectors', lang);
    const publicItemsPath = path.join(__dirname, '../public/images/items', lang);
    
    // Create directories if they don't exist
    if (!fs.existsSync(publicCollectorsPath)) {
      fs.mkdirSync(publicCollectorsPath, { recursive: true });
    }
    
    if (!fs.existsSync(publicItemsPath)) {
      fs.mkdirSync(publicItemsPath, { recursive: true });
    }
  });
  
  console.log('Public directories ensured for multiple languages');
};

module.exports = {
  getCollectors,
  getItems,
  getCollectorById,
  getItemById,
  ensurePublicDirectories
};