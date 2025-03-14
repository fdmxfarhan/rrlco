var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    enable: {
        type: Boolean,
        default: true,
    },
    title: String,
    pictures: {
        type: [String],
        default: [],
    },
    price: Number,
    nodiscountprice: Number,
    discountEnable: Boolean,
    productCode: {
        type: String,
        default: 403000001
    },
    comments: {
        type: [Object],
        default: [],
    },
    available: {
        type: Boolean,
        default: true,
    },
    shortdescription: String,
    description: {
        type: String,
        default: '',
    },
    relatedProducts: [String],
    stars: [Number],
    techspecs: {
        type: [Object],
        default: [],
    },
    producer: String,
    category: String,
    defaultcount: {
        type: Number,
        default: 1,
    },
    datasheet: {
        type: String,
        default: '',
    },
    sessionsInfo: [Object],
    date: Date,
    numofbuy: {
        type: Number,
        default: 0,
    },
    weight: {
        type: Number,
        default: 0,
    },
    showHome: {
        type: Boolean,
        default: false,
    },
    datasheet: {
        type: String,
        default: '',
    },
});

var Product = mongoose.model('Product', ProductSchema);

module.exports = Product;