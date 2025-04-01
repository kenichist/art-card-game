const mongoose = require('mongoose');

// Update the Collector schema to match our database design
const collectorSchema = mongoose.Schema(
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
// collectorSchema.index({ id: 1 }, { unique: true });

const Collector = mongoose.model('Collector', collectorSchema);

module.exports = Collector;
