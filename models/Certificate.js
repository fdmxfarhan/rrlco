var mongoose = require('mongoose');

var CertificateSchema = new mongoose.Schema({
  fullName: String,
  date: String,
  courseName: String,
  score: String,
  code: String,
});

var Certificate = mongoose.model('Certificate', CertificateSchema);

module.exports = Certificate;


