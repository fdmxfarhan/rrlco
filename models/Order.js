var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
  ownerID: String,
  ownerNmae: String,
  items: [Object],
  description: String,
  totalPrice: Number,
  discount: Number,
  tax: Number,
  deliveryPrice: Number,
  discountID: String,
  delivery: String,
  city: String,
  address: String,
  payed: Boolean,
  compeleted: Boolean,
  state: String,
  postCode: String,
  phone: String,
  date: Date,
  orderCode: {
    type: Number,
    default: 202400001,
  },
  paymentAuthority: String,
});

var Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
