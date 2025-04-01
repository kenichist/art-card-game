const mongoose = require('mongoose');

// Update the Auction schema to match our database design
const auctionSchema = mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
      ref: 'Item'
    },
    collectorId: {
      type: Number,
      ref: 'Collector'
    },
    matchedDescriptions: [
      {
        attribute: {
          type: String,
          required: true
        },
        value: {
          type: Number,
          required: true
        }
      }
    ],
    totalValue: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster lookups
// auctionSchema.index({ status: 1 });
// auctionSchema.index({ itemId: 1 });
// auctionSchema.index({ collectorId: 1 });

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
