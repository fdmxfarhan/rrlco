var mongoose = require('mongoose');

var DiscountSchema = new mongoose.Schema({
  enable: {
    type: Boolean,
    default: true,
  },
  code: String,
  type: String,
  maxDiscount: Number,
  minPurchase: Number,
  numofuse: {
    type: Number,
    default: 1,
  },
  expiredate: Object,
  date: Date,
  itemtype: String,
  userID: String,
  amount: Number,
  
});

var Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount;


