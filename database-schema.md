# Database Schema Design for Auction-Collector Matching System

## Overview
This document outlines the database schema design for the auction-collector matching system. The system allows for matching item cards with collector cards based on shared descriptions, with each matching description adding value to the collector.

## Schema Structure

### Item Collection
```javascript
{
  id: Number,          // Unique identifier matching the image file number
  name: String,        // Name of the item
  image: String,       // Path to the item image
  descriptions: [      // Array of descriptions that can be matched
    {
      attribute: String,  // Description attribute (e.g., "postmodernism products")
      value: Number       // Value of this attribute when matched (e.g., 21)
    }
  ],
  createdAt: Date,     // Timestamp when record was created
  updatedAt: Date      // Timestamp when record was last updated
}
```

### Collector Collection
```javascript
{
  id: Number,          // Unique identifier matching the image file number
  name: String,        // Name of the collector card
  image: String,       // Path to the collector image
  descriptions: [      // Array of descriptions that can be matched
    {
      attribute: String,  // Description attribute (e.g., "transportation")
      value: Number       // Value of this attribute when matched (e.g., 13)
    }
  ],
  createdAt: Date,     // Timestamp when record was created
  updatedAt: Date      // Timestamp when record was last updated
}
```

### Auction Collection
```javascript
{
  _id: ObjectId,       // MongoDB generated ID
  itemId: Number,      // Reference to the item being auctioned
  collectorId: Number, // Reference to the collector card being matched (optional until matched)
  matchedDescriptions: [  // Array of descriptions that matched between item and collector
    {
      attribute: String,  // The matched attribute
      value: Number       // The value of this match
    }
  ],
  totalValue: Number,  // Sum of all matched description values
  status: String,      // Status of the auction: 'pending', 'active', 'completed'
  createdAt: Date,     // Timestamp when record was created
  updatedAt: Date      // Timestamp when record was last updated
}
```

## Relationships
- Each Item can be referenced in multiple Auctions (one-to-many)
- Each Collector can be referenced in multiple Auctions (one-to-many)
- An Auction references exactly one Item and optionally one Collector (many-to-one)

## Matching Logic
1. When an item is presented in an auction, it is compared with a collector card
2. For each description attribute that matches between the item and collector:
   - The attribute is added to the matchedDescriptions array
   - The value of that attribute is added to the totalValue
3. The total value represents the amount the collector receives for the match

## Indexes
- Item.id: Unique index for fast lookups by ID
- Collector.id: Unique index for fast lookups by ID
- Auction.status: Index for quickly finding active auctions
- Auction.itemId: Index for finding auctions by item
- Auction.collectorId: Index for finding auctions by collector

## Data Validation
- Item and Collector IDs must be unique
- Description attributes should be standardized strings
- Description values must be positive numbers
- Auction status must be one of: 'pending', 'active', 'completed'
