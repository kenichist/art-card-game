/**
 * Script to copy collector and item card images from the Card prints folder to the public/images directory
 * with language-specific organization.
 */
const fs = require('fs');
const path = require('path');

// Define paths
const basePath = path.join(__dirname, '..', '..');
const cardPrintsPath = path.join(basePath, 'Card prints');
const publicImagesPath = path.join(basePath, 'client', 'public', 'images');

// Create directories if they don't exist
const ensureDirectories = () => {
  const dirs = [
    path.join(publicImagesPath, 'collectors', 'en'),
    path.join(publicImagesPath, 'collectors', 'zh'),
    path.join(publicImagesPath, 'items', 'en'),
    path.join(publicImagesPath, 'items', 'zh')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Copy collector images
const copyCollectorImages = () => {
  // English collector images
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'illustrations', 'collector 英文'), 
    path.join(publicImagesPath, 'collectors', 'en'),
    'i', // Prefix for illustration collectors
    10   // Max number of collectors of this type
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'products', 'collector 英文'),
    path.join(publicImagesPath, 'collectors', 'en'),
    'p', // Prefix for product collectors
    10   // Max number of collectors of this type
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'sculptures', 'collector 英文'),
    path.join(publicImagesPath, 'collectors', 'en'),
    's', // Prefix for sculpture collectors
    10   // Max number of collectors of this type
  );
  
  // Chinese collector images
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'illustrations', 'collector 中文'),
    path.join(publicImagesPath, 'collectors', 'zh'),
    'i', // Prefix for illustration collectors
    10   // Max number of collectors of this type
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'products', 'collector 中文'),
    path.join(publicImagesPath, 'collectors', 'zh'),
    'p', // Prefix for product collectors
    10   // Max number of collectors of this type
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '买家卡 15×10 cm', 'sculptures', 'collector 中文'),
    path.join(publicImagesPath, 'collectors', 'zh'),
    's', // Prefix for sculpture collectors
    10   // Max number of collectors of this type
  );
};

// Copy item images
const copyItemImages = () => {
  // English item images
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆1', 'illustration 英文'),
    path.join(publicImagesPath, 'items', 'en'),
    '', // No prefix for items, they use numbers 1-24
    24  // Max number of items of this type
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆2', 'sculpture 英文'),
    path.join(publicImagesPath, 'items', 'en'),
    '', // Items 25-48
    24,
    25  // Starting from item 25
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆3', 'product 英文'),
    path.join(publicImagesPath, 'items', 'en'),
    '', // Items 49-72
    24,
    49  // Starting from item 49
  );
  
  // Chinese item images
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆1', 'illustration 中文'),
    path.join(publicImagesPath, 'items', 'zh'),
    '', // No prefix for items, they use numbers 1-24
    24
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆2', 'sculpture 中文'),
    path.join(publicImagesPath, 'items', 'zh'),
    '', // Items 25-48
    24,
    25
  );
  
  copyImagesFromDirectory(
    path.join(cardPrintsPath, '拍卖品卡 12×9 cm （需折叠）', '牌堆3', 'product 中文'),
    path.join(publicImagesPath, 'items', 'zh'),
    '', // Items 49-72
    24,
    49
  );
};

/**
 * Helper function to copy images from a source directory to a target directory
 * @param {string} sourceDir - Source directory path
 * @param {string} targetDir - Target directory path
 * @param {string} prefix - Prefix to add to the filename (e.g., 'i', 'p', 's')
 * @param {number} maxCount - Maximum number of images to copy
 * @param {number} startNumber - Starting number for the filenames (default: 1)
 */
const copyImagesFromDirectory = (sourceDir, targetDir, prefix, maxCount, startNumber = 1) => {
  try {
    if (!fs.existsSync(sourceDir)) {
      console.warn(`Source directory not found: ${sourceDir}`);
      return;
    }

    const files = fs.readdirSync(sourceDir)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
      .filter(file => !file.includes('牌背')); // Filter out card back images
      
    // Sort the files to ensure consistent order
    files.sort();
    
    // Copy up to maxCount files with proper naming
    for (let i = 0; i < Math.min(files.length, maxCount); i++) {
      const sourceFile = path.join(sourceDir, files[i]);
      const targetFilename = `${prefix}${i + startNumber}.jpg`; // Use consistent .jpg extension
      const targetFile = path.join(targetDir, targetFilename);
      
      fs.copyFileSync(sourceFile, targetFile);
      console.log(`Copied: ${targetFilename}`);
    }
  } catch (error) {
    console.error(`Error copying files from ${sourceDir}:`, error);
  }
};

// Main function to copy all images
const copyAllImages = () => {
  try {
    console.log('Starting to copy card images...');
    
    // Ensure directories exist
    ensureDirectories();
    
    // Copy collector and item images
    copyCollectorImages();
    copyItemImages();
    
    console.log('Image copy process completed successfully.');
  } catch (error) {
    console.error('Error in image copy process:', error);
  }
};

// Run the copy process
copyAllImages();