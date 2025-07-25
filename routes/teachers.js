var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
const mail = require('../config/mail');
const dot = require('../config/dot');
const sms = require('../config/sms');
const timedigit = require('../config/timedigit');
const {productCategories, coursetypes, courseCategories} = require('../config/consts');
const RepairOrder = require('../models/RepairOrder');
const Teacher = require('../models/Teacher');


router.get('/', (req, res, next) => {
    
});

router.get('/teacher-view', (req, res, next) => {
    var teacherID = req.query.id;
    Teacher.findById(teacherID, (err, teacher) => {
        if(err) console.log(err);
        res.render('./teachers/teacher-view', {
            theme: req.session.theme,
            user: req.user,
            teacher,
        });
    })
});



module.exports = router;
