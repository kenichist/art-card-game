const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Item = require('../models/itemModel');
const Collector = require('../models/collectorModel');

// Route to import all images from project_files to public directory
router.get('/import-images', async (req, res) => {
  try {
    // Create directories if they don't exist
    const itemsDir = path.join(__dirname, '../public/images/items');
    const collectorsDir = path.join(__dirname, '../public/images/collectors');
    
    if (!fs.existsSync(itemsDir)) {
      fs.mkdirSync(itemsDir, { recursive: true });
    }
    
    if (!fs.existsSync(collectorsDir)) {
      fs.mkdirSync(collectorsDir, { recursive: true });
    }
    
    // Copy item images
    const sourceItemsDir = path.join(__dirname, '../../project_files/Items');
    const itemFiles = fs.readdirSync(sourceItemsDir)
      .filter(file => file.match(/^\d+\.jpg$/));
    
    itemFiles.forEach(file => {
      fs.copyFileSync(
        path.join(sourceItemsDir, file),
        path.join(itemsDir, file)
      );
    });
    
    // Copy collector images
    const sourceCollectorsDir = path.join(__dirname, '../../project_files/Collector');
    const collectorFiles = fs.readdirSync(sourceCollectorsDir)
      .filter(file => file.match(/^\d+\.jpg$/));
    
    collectorFiles.forEach(file => {
      fs.copyFileSync(
        path.join(sourceCollectorsDir, file),
        path.join(collectorsDir, file)
      );
    });
    
    res.json({
      message: 'Images imported successfully',
      itemsCount: itemFiles.length,
      collectorsCount: collectorFiles.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to seed database with items and collectors
router.get('/seed-database', async (req, res) => {
  try {
    // Clear existing data
    await Item.deleteMany({});
    await Collector.deleteMany({});
    
    // Sample descriptions for items and collectors
    const descriptions = [
      { attribute: 'Postmodernism products', value: 21 },
      { attribute: 'Transportation', value: 13 },
      { attribute: 'Technology', value: 18 },
      { attribute: 'Art', value: 15 },
      { attribute: 'Fashion', value: 12 },
      { attribute: 'Food', value: 10 },
      { attribute: 'Sports', value: 14 },
      { attribute: 'Music', value: 16 },
      { attribute: 'Literature', value: 17 },
      { attribute: 'Architecture', value: 19 }
    ];
    
    // Function to get random descriptions
    const getRandomDescriptions = (count) => {
      const shuffled = [...descriptions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    // Seed items
    const itemsDir = path.join(__dirname, '../public/images/items');
    const itemFiles = fs.readdirSync(itemsDir)
      .filter(file => file.match(/^\d+\.jpg$/))
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    const items = itemFiles.map(file => {
      const id = parseInt(file.split('.')[0]);
      return {
        id,
        name: `Item ${id}`,
        image: `/images/items/${file}`,
        descriptions: getRandomDescriptions(Math.floor(Math.random() * 3) + 1)
      };
    });
    
    await Item.insertMany(items);
    
    // Seed collectors
    const collectorsDir = path.join(__dirname, '../public/images/collectors');
    const collectorFiles = fs.readdirSync(collectorsDir)
      .filter(file => file.match(/^\d+\.jpg$/))
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    const collectors = collectorFiles.map(file => {
      const id = parseInt(file.split('.')[0]);
      return {
        id,
        name: `Collector ${id}`,
        image: `/images/collectors/${file}`,
        descriptions: getRandomDescriptions(Math.floor(Math.random() * 3) + 1)
      };
    });
    
    await Collector.insertMany(collectors);
    
    res.json({
      message: 'Database seeded successfully',
      itemsCount: items.length,
      collectorsCount: collectors.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
