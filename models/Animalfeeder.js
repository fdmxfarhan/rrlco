var mongoose = require('mongoose');

var AnimalfeederSchema = new mongoose.Schema({
  id: String,
  times: {
    type: [Object],
    default: [
      {hour: 9, minute: 0, second: 0},
      {hour: 13, minute: 0, second: 0},
      {hour: 19, minute: 0, second: 0},
    ],
  },
  enable: {
    type: Boolean,
    default: true,
  }
});

var Animalfeeder = mongoose.model('Animalfeeder', AnimalfeederSchema);

module.exports = Animalfeeder;
