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
router.get('/edit-teacher', ensureAuthenticated, (req, res, next) => {
    var teacherID = req.query.id;
    if(req.user.role == 'admin'){
        Teacher.findById(teacherID, (err, teacher) => {
            if(err) console.log(err);
            res.render('./teachers/teacher-edit', {
                theme: req.session.theme,
                user: req.user,
                teacher,
            });
        })
    }else res.send('access denied!!');
});
router.post('/add-education', (req, res, next) => {
    var {teacherID, title, subject, date, degree} = req.body;
    console.log(req.body)
    Teacher.findById(teacherID, (err, teacher) => {
        if(err) console.log(err);
        teacher.educations.push({title, subject, date, degree});
        teacher.save().then(doc => {
            req.flash('success_msg', 'تحصیلات اضافه شد');
            res.redirect(`/teachers/teacher-view?id=${teacherID}`);
        }).catch(err => console.log(err))
    })
});
router.get('/remove-education', (req, res, next) => {
    var {teacherID, index} = req.query;
    Teacher.findById(teacherID, (err, teacher) => {
        if(err) console.log(err);
        teacher.educations.splice(index, 1);
        teacher.save().then(doc => {
            req.flash('success_msg', 'تحصیلات حذف شد');
            res.redirect(`/teachers/teacher-view?id=${teacherID}`);
        }).catch(err => console.log(err))
    })
})
router.post('/add-experience', (req, res, next) => {
    var {teacherID, title, description, date, location} = req.body;
    console.log(req.body)
    Teacher.findById(teacherID, (err, teacher) => {
        if(err) console.log(err);
        teacher.experiences.push({title, description, date, location});
        teacher.save().then(doc => {
            req.flash('success_msg', 'تحصیلات اضافه شد');
            res.redirect(`/teachers/teacher-view?id=${teacherID}`);
        }).catch(err => console.log(err))
    })
});
router.get('/remove-experience', (req, res, next) => {
    var {teacherID, index} = req.query;
    Teacher.findById(teacherID, (err, teacher) => {
        if(err) console.log(err);
        teacher.experiences.splice(index, 1);
        teacher.save().then(doc => {
            req.flash('success_msg', 'تحصیلات حذف شد');
            res.redirect(`/teachers/teacher-view?id=${teacherID}`);
        }).catch(err => console.log(err))
    })
})

module.exports = router;
