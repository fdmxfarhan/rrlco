var mongoose = require('mongoose');

var ArchiveSchema = new mongoose.Schema({
    object: {
        type: Object,
    },
    date: String,
    userID: String,
    objectType: String,
    action: String,
    userFullname: {
        type: String,
        default: '',
    }
});

var Archive = mongoose.model('Archive', ArchiveSchema);

module.exports = Archive;