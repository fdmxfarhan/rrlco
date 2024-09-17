var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
const mail = require('../config/mail');
const dot = require('../config/dot');
const timedigit = require('../config/timedigit');
const {productCategories, coursetypes, courseCategories} = require('../config/consts')


router.get('/', (req, res, next) => {
    var { category } = req.query;
    Course.find({enable: true}, (err, courses) => {
        if(category) courses = courses.filter((e) => e.category == category);
        res.render('./courses/courses', {
            theme: req.session.theme,
            user: req.user,
            courses,
            courseCategories,
            dot, 
            timedigit,
            category,
        });
    });
});
router.get('/course-view', (req, res, next) => {
    var courseID = req.query.id;
    Course.findById(courseID, (err, course) => {
        var purchased = false;
        if(req.user) purchased = req.user.courses.some(item => item.id === courseID);
        res.render('./courses/course-view', {
            theme: req.session.theme,
            user: req.user,
            course,
            courseCategories,
            dot, timedigit,
            purchased,
        });
    })
});
router.get('/course-session', (req, res, next) => {
    var courseID = req.query.id;
    var sessionIndex = req.query.index;
    console.log(req.query);
    Course.findById(courseID, (err, course) => {
        var purchased = false;
        if(req.user) purchased = req.user.courses.some(item => item.id === courseID);
        res.render('./courses/course-session', {
            theme: req.session.theme,
            user: req.user,
            course,
            courseCategories,
            dot, timedigit,
            sessionIndex,
            session: course.sessionContents[sessionIndex],
            purchased,
        });
    })
});
router.get('/edit-session', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    var sessionIndex = req.query.index
    if(req.user.role == 'admin'){
        Course.findById(courseID, (err, course) => {
            res.render('./courses/edit-session', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                sessionIndex,
                session: course.sessionContents[sessionIndex],
            });
        });
    }else res.render('./error');
});
router.get('/enable-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if(req.user.role == 'admin'){
        Course.updateMany({_id: courseID}, {$set: {enable: true}}, (err, course) => {
            res.redirect(`/courses/course-view?id=${courseID}`);
        });
    }
    else res.render('./error')
});   
router.get('/disable-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if(req.user.role == 'admin'){
        Course.updateMany({_id: courseID}, {$set: {enable: false}}, (err, course) => {
            res.redirect(`/courses/course-view?id=${courseID}`);
        });
    }
    else res.render('./error')
});    
router.get('/delete-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if(req.user.role == 'admin'){
        Course.deleteOne({_id: courseID}, (err) => {
            res.redirect(`/courses`);
        });
    }
    else res.render('./error')
});   
router.get('/edit-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    Course.findById(courseID, (err, course) => {
        res.render('./courses/edit-course', {
            theme: req.session.theme,
            user: req.user,
            course,
            courseCategories,
            coursetypes,
            dot, timedigit,
        });
    });
});   
router.post('/edit-course', ensureAuthenticated, (req, res, next) => {
    var {courseID, minCap, title, price, nodiscountprice, shortdescription, description, teacher, type, category, sessions, hours, minutes, capacity, classLink} = req.body;
    if(req.user.role == 'admin'){
        Course.updateMany({_id: courseID}, {$set: {minCap, title, price, nodiscountprice, shortdescription, description, teacher, type, category, sessions, totalTime: {hours, minutes, seconds: 0}, capacity, classLink}}, (err, course) => {
            req.flash('success_msg', 'تغیرات ذخیره شد.');
            res.redirect(`/courses/course-view?id=${courseID}`);
        });
    }
});   
router.get('/register-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    User.updateMany({_id: req.user._id}, {$set: {
        payableCourse: {
            id: courseID, 
            payed: false, 
            auth: ''
        }}}, (err) => {
        res.redirect(`/payment/pay-online-course`)
    });
});   

module.exports = router;
