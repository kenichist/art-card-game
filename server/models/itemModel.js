
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
    image: { // Path to the 2D preview image
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
    ],
    modelPath: { // Path to the 3D model file (e.g., /models/item-1.glb)
        type: String,
        required: false // Make it optional if not all items will have a 3D model initially
    },
    // Optional: Add fields for default scale/rotation if needed per model
    // modelScale: {
    //     type: Number,
    //     default: 1
    // },
    // modelRotationY: { // Example specific rotation if needed
    //     type: Number,
    //     default: 0
    // }
  },
  {
    timestamps: true
  }
);

// Optional: Create indexes for faster lookups if needed, especially on `id`
// itemSchema.index({ id: 1 }, { unique: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
