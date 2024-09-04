var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
  enable: {
    type: Boolean,
    default: true,
  },
  title: String, 
  price: Number, // Rial
  pricenodiscount: Number, //percent
  shortdescription: String,
  description: String,
  teacher: String,
  teacherID: String,
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
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;


