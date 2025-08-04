var mongoose = require('mongoose');

var BlogpostSchema = new mongoose.Schema({
  title: String,
  content: String, // HTML content
  createdAt: { type: Date, default: Date.now }
});

var Blogpost = mongoose.model('Blogpost', BlogpostSchema);

module.exports = Blogpost;
