var mongoose = require('mongoose');

var RepairOrderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  fullname: String,
  phone: String,
  type: String,
  address: String,
  picture: String,
  code: String,
  date: Object,
  count: Number,
  state: {
    type: String,
    default: 'ثبت سفارش',
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  deliveryPrice: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  payed: {
    type: String,
    default: false,
  },
});

var RepairOrder = mongoose.model('RepairOrder', RepairOrderSchema);

module.exports = RepairOrder;
