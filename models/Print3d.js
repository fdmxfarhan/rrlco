var mongoose = require('mongoose');

var Print3dSchema = new mongoose.Schema({
    title: String,
    file: String,
    date: Date,
    filament: String,
    infill: Number,
    count: Number,
    color: String,
    price: Number,
    ordered: {
        type: Boolean,
        default: false,
    },
    username: {
        type: String,
        default: 'undefined',
    },
    userID: {
        type: String,
        default: 'undefined',
    },
    layerhieght: {
        type: Number,
        default: 0.2,
    },
});

var Print3d = mongoose.model('Print3d', Print3dSchema);

module.exports = Print3d;