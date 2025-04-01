const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Item = require('./models/itemModel');
const Collector = require('./models/collectorModel');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Sample descriptions for items
const itemDescriptions = [
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

// Sample descriptions for collectors
const collectorDescriptions = [
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
const getRandomDescriptions = (descArray, count) => {
  const shuffled = [...descArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to seed items
const seedItems = async () => {
  try {
    // Clear existing items
    await Item.deleteMany({});
    
    // Get list of item image files
    const itemsDir = path.join(__dirname, '../project_files/Items');
    const files = fs.readdirSync(itemsDir);
    
    // Filter only numbered jpg files
    const itemFiles = files.filter(file => 
      file.match(/^\d+\.jpg$/)
    ).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
    
    // Create items
    const items = itemFiles.map(file => {
      const id = parseInt(file.split('.')[0]);
      return {
        id,
        name: `Item ${id}`,
        image: `/images/items/${file}`,
        descriptions: getRandomDescriptions(itemDescriptions, Math.floor(Math.random() * 3) + 1)
      };
    });
    
    await Item.insertMany(items);
    console.log(`${items.length} items seeded successfully`);
  } catch (error) {
    console.error(`Error seeding items: ${error.message}`);
  }
};

// Function to seed collectors
const seedCollectors = async () => {
  try {
    // Clear existing collectors
    await Collector.deleteMany({});
    
    // Get list of collector image files
    const collectorsDir = path.join(__dirname, '../project_files/Collector');
    const files = fs.readdirSync(collectorsDir);
    
    // Filter only numbered jpg files
    const collectorFiles = files.filter(file => 
      file.match(/^\d+\.jpg$/)
    ).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
    
    // Create collectors
    const collectors = collectorFiles.map(file => {
      const id = parseInt(file.split('.')[0]);
      return {
        id,
        name: `Collector ${id}`,
        image: `/images/collectors/${file}`,
        descriptions: getRandomDescriptions(collectorDescriptions, Math.floor(Math.random() * 3) + 1)
      };
    });
    
    await Collector.insertMany(collectors);
    console.log(`${collectors.length} collectors seeded successfully`);
  } catch (error) {
    console.error(`Error seeding collectors: ${error.message}`);
  }
};

// Run seeding
const seedDatabase = async () => {
  try {
    await seedItems();
    await seedCollectors();
    console.log('Database seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
