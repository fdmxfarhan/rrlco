var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
  enable: {
    type: Boolean,
    default: true,
  },
  title: String, 
  price: Number, // Rial
  nodiscountprice: Number, //percent
  shortdescription: String,
  description: String,
  teacher: String,
  teacherID: {type: String, default: ''},
  teacherCV: String,
  type: String,
  startDate: Date,
  sessions: Number,
  totalTime: {
    type: Object,
    default: {hours: 0, minutes: 0, seconds: 0},
  },
  requiredCourse: [Object],
  requiredTools: [Object],
  minAge: Number,
  maxAge: Number,
  status: String,
  capacity: Number,
  category: String,
  numofattendes: {
    type: Number,
    default: 1,
  },
  cover: String,
  courseCode: {
    type: String,
    default: 403100001
  },
  date: Date,
  sessionContents: {
    type: [Object],
    default: [],
  },
  classLink: {
    type: String,
    default: '',
  },
  minCap: {
    type: Number,
    default: 1,
  },
  hasDiscount: {type: Boolean, default: true},
  sortWeight: {
    type: Number,
    default: 0,
  }
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;


