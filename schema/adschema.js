const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  adId: {
    type: Number, // Unique identifier for the ad
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  fuel: {
    type: String,
    enum: ['DIESEL', 'PETROL', 'ELECTRIC', 'CNG & HYBRID'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['AUTOMATIC', 'MANUAL'],
    required: true
  },
  kmDriven: {
    type: Number,
    required: true
  },
  owners: {
    type: String,
    enum: ['1st', '2nd', '3rd'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  images: {
    type: [String], // Array of image filenames or URLs
    default: []
  },
  
}, {
  timestamps: true // Adds createdAt and updatedAt
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
