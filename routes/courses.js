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
        if(!req.user){
            res.render('./courses/course-view', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                purchased: false,
            });
        }
        else if(req.user.role == 'user'){
            var purchased = req.user.courses.some(item => item.id === courseID);
            res.render('./courses/course-view', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                purchased,
            });
        }
        else if(req.user.role == 'admin'){
            var purchased = req.user.courses.some(item => item.id === courseID);
            User.find({role: 'user'}, (err, allUsers) => {
                // User.find({role: 'user', courses: { $elemMatch: { id: courseID } }}, (err, participators) => {});
                const participators = allUsers.filter(user => user.courses.some(course => course.id === courseID));
                res.render('./courses/course-view', {
                    theme: req.session.theme,
                    user: req.user,
                    course,
                    courseCategories,
                    dot, timedigit,
                    purchased,
                    participators,
                    allUsers,
                });
            })
        }
    });
});
router.get('/course-session', (req, res, next) => {
    var courseID = req.query.id;
    var sessionIndex = req.query.index;
    console.log(req.query);
    Course.findById(courseID, (err, course) => {
        var session = course.sessionContents[sessionIndex];
        var purchased = false;
        if(req.user) purchased = req.user.courses.some(item => item.id === courseID);
        if(session.type != 'locked' || purchased || (req.user && req.user.role == 'admin')){
            res.render('./courses/course-session', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                sessionIndex,
                session: session,
                purchased,
            });
        }
        else{
            req.flash('error_msg', `دسترسی مجاز نمی‌باشد.`);
            res.redirect(`/courses/course-view?id=${courseID}`);
        }
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
router.post('/online-course/add-participator', ensureAuthenticated, (req, res, next) => {
    var {courseID, userID} = req.body;
    if(req.user.role == 'admin'){
        User.findById(userID, (err, user) => {
            if(user){
                var userCourses = user.courses;
                var purchased = userCourses.some(item => item.id === courseID);
                if(purchased){
                    req.flash('error_msg', 'کاربر در دوره ثبت نام شده');
                    res.redirect(`/courses/course-view?id=${courseID}`);
                }else{
                    userCourses.push({id: courseID, payed: true, auth: 'added-by-admin'});
                    User.updateMany({_id: userID}, {$set: {courses: userCourses}}, (err, doc) => {
                        req.flash('success_msg', 'کاربر اضافه شد');
                        res.redirect(`/courses/course-view?id=${courseID}`);
                    });
                }
            }else res.send('no user found!!');
        })
    }
});
router.get('/online-course/delete-participator', ensureAuthenticated, (req, res, next) => {
    var {courseID, userID} = req.query;
    if(req.user.role == 'admin'){
        User.findById(userID, (err, user) => {
            if(user){
                var userCourses = user.courses.filter(course => course.id !== courseID);;
                User.updateMany({_id: userID}, {$set: {courses: userCourses}}, (err, doc) => {
                    req.flash('success_msg', 'کاربر حذف شد');
                    res.redirect(`/courses/course-view?id=${courseID}`);
                });
            }else res.send('no user found!!');
        })
    }
});
router.post('/add-session', ensureAuthenticated, (req, res, next) => {
    var {sessionIndex, courseID, title, hours, minutes, description, type, filePath} = req.body;
    Course.findById(courseID, (err, course) => {
        if(req.user.role == 'admin'){
            if(course.sessionContents.length != course.sessions){
                course.sessionContents = [];
                for(var i=0; i<course.sessions; i++){
                    course.sessionContents.push({
                        title: '', hours: 0, minutes: 0, description: '', type: 'locked', file: '',
                    });
                }
            }
            course.sessionContents[sessionIndex] = {
                title, hours, minutes, description, type, file: filePath,
            }
            Course.updateMany({_id: courseID}, {$set: {sessionContents: course.sessionContents}}, (err) => {
                res.redirect(`/courses/course-session?index=${sessionIndex}&id=${courseID}`);
            });
        }
    });
});

module.exports = router;
