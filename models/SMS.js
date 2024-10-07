var mongoose = require('mongoose');

var SMSSchema = new mongoose.Schema({
    target: String,
    text: String,
    date: Object,
    time: Object,
    sender: String,
});

var SMS = mongoose.model('SMS', SMSSchema);

module.exports = SMS;
