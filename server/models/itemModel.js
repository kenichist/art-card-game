const mongoose = require('mongoose');

// Update the Item schema to match our database design
const itemSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    descriptions: [
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
    ]
  },
  {
    timestamps: true
  }
);

// Create indexes for faster lookups
// itemSchema.index({ id: 1 }, { unique: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
