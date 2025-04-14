const fs = require('fs');
const path = require('path');

// Updated paths to match where you moved the images
const baseCollectorsPath = path.join(__dirname, '../../client/public/images/collectors');
const baseItemsPath = path.join(__dirname, '../../client/public/images/items');
const customDataPath = path.join(__dirname, '../data');

// Make sure the data directory exists
if (!fs.existsSync(customDataPath)) {
  fs.mkdirSync(customDataPath, { recursive: true });
}

// Paths to card customization data files
const itemCustomizationPath = path.join(customDataPath, 'item-customization.json');
const collectorCustomizationPath = path.join(customDataPath, 'collector-customization.json');

// Load or initialize customization data
let itemCustomizations = {};
let collectorCustomizations = {};

try {
  if (fs.existsSync(itemCustomizationPath)) {
    itemCustomizations = JSON.parse(fs.readFileSync(itemCustomizationPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading item customizations:', error);
  itemCustomizations = {};
}

try {
  if (fs.existsSync(collectorCustomizationPath)) {
    collectorCustomizations = JSON.parse(fs.readFileSync(collectorCustomizationPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading collector customizations:', error);
  collectorCustomizations = {};
}

/**
 * Get localized type name based on language and prefix
 * @param {String} prefix Item or collector type prefix (i, s, p)
 * @param {String} lang Language code ('en' or 'zh')
 * @param {Boolean} isItem Whether this is an item (true) or collector (false)
 * @returns {String} Localized type name
 */
const getLocalizedTypeName = (prefix, lang, isItem = true) => {
  // For items
  if (isItem) {
    if (prefix >= 1 && prefix <= 24) {
      return lang === 'zh' ? '插画物品' : 'Illustration Item';
    } else if (prefix >= 25 && prefix <= 48) {
      return lang === 'zh' ? '雕塑物品' : 'Sculpture Item';
    } else if (prefix >= 49 && prefix <= 72) {
      return lang === 'zh' ? '产品物品' : 'Product Item';
    }
    return lang === 'zh' ? '未知物品类型' : 'Unknown Item Type';
  } 
  // For collectors
  else {
    if (prefix.toLowerCase() === 'i') {
      return lang === 'zh' ? '插画收藏家' : 'Illustration Collector';
    } else if (prefix.toLowerCase() === 'p') {
      return lang === 'zh' ? '产品收藏家' : 'Product Collector';
    } else if (prefix.toLowerCase() === 's') {
      return lang === 'zh' ? '雕塑收藏家' : 'Sculpture Collector';
    }
    return lang === 'zh' ? '收藏家' : 'Collector';
  }
};

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
        const prefix = file.charAt(0);
        const typeName = getLocalizedTypeName(prefix, lang, false);
        const collectorId = getCollectorId(file);
        
        // Get custom title and description if available
        const customData = collectorCustomizations[collectorId] || {};
        const customTitleKey = `title_${lang}`;
        const customDescriptionKey = `description_${lang}`;
        
        return {
          id: collectorId,
          name: customData[customTitleKey] || `${typeName} ${id}`,
          description: customData[customDescriptionKey] || "",
          image: `/images/collectors/${lang}/${file}`,
          originalPath: path.join(folderToUse, file),
          language: lang,
          customized: !!customData[customTitleKey]
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
        const typeName = getLocalizedTypeName(id, lang, true);
        
        // Get custom title and description if available
        const customData = itemCustomizations[id] || {};
        const customTitleKey = `title_${lang}`;
        const customDescriptionKey = `description_${lang}`;
        
        return {
          id,
          name: customData[customTitleKey] || `${typeName} ${id}`,
          description: customData[customDescriptionKey] || "",
          image: `/images/items/${lang}/${file}`,
          originalPath: path.join(folderToUse, file),
          language: lang,
          customized: !!customData[customTitleKey]
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
 * Save customization data for an item
 * @param {Number} id Item ID
 * @param {Object} customData Customization data with titles and descriptions
 * @returns {Boolean} Success status
 */
const saveItemCustomization = (id, customData) => {
  try {
    id = parseInt(id);
    if (isNaN(id) || id < 1 || id > 72) {
      return false;
    }
    
    // Update the customization data
    itemCustomizations[id] = {
      ...(itemCustomizations[id] || {}),
      ...customData
    };
    
    // Write to file
    fs.writeFileSync(
      itemCustomizationPath,
      JSON.stringify(itemCustomizations, null, 2),
      'utf8'
    );
    
    return true;
  } catch (error) {
    console.error(`Error saving item customization for ID ${id}:`, error);
    return false;
  }
};

/**
 * Save customization data for a collector
 * @param {Number} id Collector ID
 * @param {Object} customData Customization data with titles and descriptions
 * @returns {Boolean} Success status
 */
const saveCollectorCustomization = (id, customData) => {
  try {
    id = parseInt(id);
    if (isNaN(id) || id < 1 || id > 30) {
      return false;
    }
    
    // Update the customization data
    collectorCustomizations[id] = {
      ...(collectorCustomizations[id] || {}),
      ...customData
    };
    
    // Write to file
    fs.writeFileSync(
      collectorCustomizationPath,
      JSON.stringify(collectorCustomizations, null, 2),
      'utf8'
    );
    
    return true;
  } catch (error) {
    console.error(`Error saving collector customization for ID ${id}:`, error);
    return false;
  }
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
  saveItemCustomization,
  saveCollectorCustomization,
  ensurePublicDirectories
};