// --- START OF FILE server/models/itemModel.js ---

const mongoose = require('mongoose');

// Update the Item schema to remove the 'value' from descriptions
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
    image: { // Path to the 2D preview image (e.g., /images/item-123.jpg)
             // CONTROLLER MUST SAVE THIS CORRECTLY
      type: String,
      required: true
    },
    descriptions: [
      { // Now descriptions are just objects with an attribute string
        attribute: {
          type: String,
          required: true
        }
        // REMOVED: value field
        // value: {
        //   type: Number,
        //   required: true
        // }
      }
    ]
    // REMOVED: Model path fields
  },
  {
    timestamps: true
  }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
// --- END OF FILE server/models/itemModel.js ---