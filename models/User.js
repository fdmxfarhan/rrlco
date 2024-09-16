var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  addresses: [Object],
  mainAddress: String,
  email: String,
  idNumber: String,
  ipAddress: String,
  phone: String,
  education: String,
  fullname: String,
  password: String,
  role: String,
  card: Number,
  sex: String,
  file: {
    type: [Object],
    default: []
  },
  avatar: Number,
  course: [Object],
  date: Date,
  shoppingcart: {
    type: [Object],
    default: [],
  },
  phoneConfirmed: {
    type: Boolean,
    default: false,
  },
  confirmcode: String,
  currentdicount: {
    type: Object,
    default: {_id: ''},
  },
  courses: {
    type: [Object],
    default: [],
  },
  payableCourse: Object,
  paymentAuthority: String,
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
