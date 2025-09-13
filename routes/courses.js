var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
var Teacher = require('../models/Teacher');
var Discount = require('../models/Discount');
const mail = require('../config/mail');
const dot = require('../config/dot');
const timedigit = require('../config/timedigit');
const { productCategories, coursetypes, courseCategories } = require('../config/consts')
const bcrypt = require('bcryptjs');
const sms = require('../config/sms');


router.get('/', (req, res, next) => {
    var { category } = req.query;
    Course.find({ enable: true }, (err, courses) => {
        if (category) courses = courses.filter((e) => e.category == category);
        products.sort((a, b) => b.sortWeight - a.sortWeight);
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
        if (!req.user) {
            res.render('./courses/course-view', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                purchased: false,
                courseDiscount: req.session.courseDiscount,
            });
        }
        else if (req.user.role == 'user') {
            var purchased = req.user.courses.some(item => item.id === courseID);
            res.render('./courses/course-view', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                dot, timedigit,
                purchased,
                courseDiscount: req.session.courseDiscount,
            });
        }
        else if (req.user.role == 'admin') {
            var purchased = req.user.courses.some(item => item.id === courseID);
            User.find({ role: 'user' }, (err, allUsers) => {
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
                    courseDiscount: req.session.courseDiscount,
                });
            })
        }
    });
});
router.get('/course-session', (req, res, next) => {
    var courseID = req.query.id;
    var sessionIndex = req.query.index;
    Course.findById(courseID, (err, course) => {
        var session = course.sessionContents[sessionIndex];
        var purchased = false;
        if (req.user) purchased = req.user.courses.some(item => item.id === courseID);
        if (session.type != 'locked' || purchased || (req.user && req.user.role == 'admin')) {
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
        else {
            if (req.user) {
                req.flash('error_msg', `دسترسی مجاز نمی‌باشد.`);
                res.redirect(`/courses/course-view?id=${courseID}`);
            }
            else {
                req.flash('error_msg', `لطفا ابتدا وارد حساب کاربری شوید`);
                res.redirect(`/users/login`);
            }
        }
    })
});
router.get('/edit-session', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    var sessionIndex = req.query.index
    if (req.user.role == 'admin') {
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
    } else res.render('./error');
});
router.get('/enable-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if (req.user.role == 'admin') {
        Course.updateMany({ _id: courseID }, { $set: { enable: true } }, (err, course) => {
            res.redirect(`/courses/course-view?id=${courseID}`);
        });
    }
    else res.render('./error')
});
router.get('/disable-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if (req.user.role == 'admin') {
        Course.updateMany({ _id: courseID }, { $set: { enable: false } }, (err, course) => {
            res.redirect(`/courses/course-view?id=${courseID}`);
        });
    }
    else res.render('./error')
});
router.get('/delete-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    if (req.user.role == 'admin') {
        Course.deleteOne({ _id: courseID }, (err) => {
            res.redirect(`/courses`);
        });
    }
    else res.render('./error')
});
router.get('/edit-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    Course.findById(courseID, (err, course) => {
        Teacher.find({}, (err, teachers) => {
            res.render('./courses/edit-course', {
                theme: req.session.theme,
                user: req.user,
                course,
                courseCategories,
                coursetypes,
                dot, timedigit,
                teachers,
            });
        })
    });
});
router.post('/edit-course', ensureAuthenticated, (req, res, next) => {
    var { sortWeight, courseID, minCap, title, price, nodiscountprice, shortdescription, description, teacherID, type, category, sessions, hours, minutes, capacity, classLink } = req.body;
    if (req.user.role == 'admin') {
        Teacher.findById(teacherID, (err, teacher) => {
            Course.updateMany({ _id: courseID }, { $set: { sortWeight, minCap, title, price, nodiscountprice, shortdescription, description, teacherID, type, category, sessions, totalTime: { hours, minutes, seconds: 0 }, capacity, classLink, teacher: teacher.firstName + ' ' + teacher.lastName } }, (err, course) => {
                req.flash('success_msg', 'تغیرات ذخیره شد.');
                res.redirect(`/courses/course-view?id=${courseID}`);
            });
        })
    }
});
router.get('/register-course', ensureAuthenticated, (req, res, next) => {
    var courseID = req.query.id;
    User.updateMany({ _id: req.user._id }, {
        $set: {
            payableCourse: {
                id: courseID,
                payed: false,
                auth: '',
            }
        }
    }, (err) => {
        res.redirect(`/payment/pay-online-course`)
    });
});
router.post('/register-and-addtocart', (req, res, next) => {
    var {
        courseID,
        firstName,
        lastName,
        phone,
        email,
        address,
        password,
        configpassword
    } = req.body;
    const ipAddress = req.connection.remoteAddress;
    const role = 'user',
        card = 0;
    const fullname = firstName + ' ' + lastName;
    let errors = [];
    User.findOne({
        $or: [{
            email: email
        }, {
            phone: phone
        }]
    }, (err, user) => {
        if (user) {
            errors.push({
                msg: 'ایمیل یا شماره تلفن قبلا ثبت شده است.'
            });
            res.render('register', {
                firstName,
                lastName,
                phone,
                email,
                errors,
                address
            });
        } else {
            const newUser = new User({
                ipAddress,
                fullname,
                firstName,
                lastName,
                phone,
                email,
                password,
                role,
                card,
                address,
                shoppingcart: [],
                payableCourse: {
                    id: courseID,
                    payed: false,
                    auth: ''
                }
            });
            // Hash password
            bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save().then(user => {
                    req.login(user, (err) => {
                        if (err) {
                            console.log(err);
                            return res.redirect('/users/login');
                        }
                        sms('09336448037', `ثبت نام کاربر جدید:\n ${fullname}\n ${phone}`);
                        sms(phone, 'به مرکز تحقیقات رباتیک و برنامه نویسی خوش آمدید.\n https://rrlco.ir')
                        req.flash('success_msg', 'ثبت نام با موفقیت انجام شد.');
                        res.redirect(`/payment/pay-online-course`)
                    });
                }).catch(err => console.log(err));
            }));
        }
    })
});
router.post('/online-course/add-participator', ensureAuthenticated, (req, res, next) => {
    var { courseID, userID } = req.body;
    if (req.user.role == 'admin') {
        User.findById(userID, (err, user) => {
            if (user) {
                var userCourses = user.courses;
                var purchased = userCourses.some(item => item.id === courseID);
                if (purchased) {
                    req.flash('error_msg', 'کاربر در دوره ثبت نام شده');
                    res.redirect(`/courses/course-view?id=${courseID}`);
                } else {
                    userCourses.push({ id: courseID, payed: true, auth: 'added-by-admin' });
                    User.updateMany({ _id: userID }, { $set: { courses: userCourses } }, (err, doc) => {
                        req.flash('success_msg', 'کاربر اضافه شد');
                        res.redirect(`/courses/course-view?id=${courseID}`);
                    });
                }
            } else res.send('no user found!!');
        })
    }
});
router.get('/online-course/delete-participator', ensureAuthenticated, (req, res, next) => {
    var { courseID, userID } = req.query;
    if (req.user.role == 'admin') {
        User.findById(userID, (err, user) => {
            if (user) {
                var userCourses = user.courses.filter(course => course.id !== courseID);;
                User.updateMany({ _id: userID }, { $set: { courses: userCourses } }, (err, doc) => {
                    req.flash('success_msg', 'کاربر حذف شد');
                    res.redirect(`/courses/course-view?id=${courseID}`);
                });
            } else res.send('no user found!!');
        })
    }
});
router.post('/add-session', ensureAuthenticated, (req, res, next) => {
    var { sessionIndex, courseID, title, hours, minutes, description, type, filePath } = req.body;
    Course.findById(courseID, (err, course) => {
        if (req.user.role == 'admin') {
            if (course.sessionContents.length != course.sessions) {
                course.sessionContents = [];
                for (var i = 0; i < course.sessions; i++) {
                    course.sessionContents.push({
                        title: '', hours: 0, minutes: 0, description: '', type: 'locked', file: '',
                    });
                }
            }
            course.sessionContents[sessionIndex] = {
                title, hours, minutes, description, type, file: filePath,
            }
            Course.updateMany({ _id: courseID }, { $set: { sessionContents: course.sessionContents } }, (err) => {
                res.redirect(`/courses/course-session?index=${sessionIndex}&id=${courseID}`);
            });
        }
    });
});
router.get('/add-discount', (req, res, next) => {
    var { courseID, code } = req.query;
    Discount.findOne({code}, (err, discount) => {
        if(discount){
            console.log(discount);
            if(discount.enable && discount.itemtype == 'course' && discount.userID == 'all'){
                req.session.courseDiscount = discount;
                req.flash('success_msg', 'کد تخفیف با موفقیت اعمال شد!');
                res.redirect(`/courses/course-view?id=${courseID}`);
            }
            else{
                req.flash('error_msg', 'این کد تخفیف قابل استفاده نمیباشد!');
                res.redirect(`/courses/course-view?id=${courseID}`);
            }
        }else{
            req.flash('error_msg', 'کد تخفیف اشتباه می‌باشد!');
            res.redirect(`/courses/course-view?id=${courseID}`);
        }
    })
});
router.get('/delete-discount', (req, res, next) => {
    req.session.courseDiscount = null;
    req.flash('success_msg', 'کد تخفیف با موفقیت حذف شد!');
    res.redirect(req.get('referer')); // Redirect to the previous URL
});

module.exports = router;
