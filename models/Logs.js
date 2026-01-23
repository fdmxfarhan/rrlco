var mongoose = require('mongoose');

var LogsSchema = new mongoose.Schema({
    date: String,
    title: String,
    type: String, /// disable-all-products, delete-product, delete-course, delete-user
    backup: Object,
    userName: String,
    userID: String,
    time: String, 
});

var Logs = mongoose.model('Logs', LogsSchema);

module.exports = Logs;