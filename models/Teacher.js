var mongoose = require('mongoose');

var TeacherSchema = new mongoose.Schema({
  enable: {
    type: Boolean,
    default: true,
  },
  fullname: {
    type: String,
    default: '',
  }, 
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  title: String,
  cover: {
    type: String,
    default: '',
  },
  address: String,
  website: String,
  phone: String,
  telegram: String,
  instagram: String,
  email: String,
  educations: {
    type: [Object],
    default: [],
  },
  experiences: {
    type: [Object],
    default: [],
  },
  description: {
    type: String,
    default: '',
  },
  age: Number,
  experienceYears: Number,
  numOfCourses: Number,
  lastUpdate: String,
  fields: {
    type: [String],
    default: [],
  },
  stars: {
    type: Number,
    default: 5,
  },
  comments: {
    type: [String],
    default: [],
  },
  date: Date,
});

var Teacher = mongoose.model('Teacher', TeacherSchema);

module.exports = Teacher;


