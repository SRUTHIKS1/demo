const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
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

        required: true
    },
    transmission: {
        type: String,

        required: true
    },
    kmDriven: {
        type: Number,
        required: true
    },
    owners: {
        type: String,

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
    images: [String],
},
 {
    timestamps: true
});

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
