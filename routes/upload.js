var express = require('express');
var path = require('path');
var router = express.Router();
var bodyparser = require('body-parser');
const multer = require('multer');
const mail = require('../config/mail');
const sms = require('../config/sms');
const {ensureAuthenticated} = require('../config/auth');
const User = require('../models/User');
const mkdirp = require('mkdirp');
const Product = require('../models/Product');
const Course = require('../models/Course');
const Print3d = require('../models/Print3d');
const RepairOrder = require('../models/RepairOrder');
const dateConvert = require('../config/dateConvert');
const Teacher = require('../models/Teacher');
const Blogpost = require('../models/Blogpost');

router.use(bodyparser.urlencoded({extended: true}));
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/files/' + Date.now().toString();
        mkdirp(dir, err => {
            if(err) console.log(err);
            cb(err, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });

router.post('/add-product', ensureAuthenticated, upload.single('picture'), (req, res, next) => {
    const file = req.file;
    const { title, price, nodiscountprice, shortdescription, description, category, defaultcount} = req.body;
    if (!file) {
        res.send('no file to upload');
    }
    else if(req.user.role == 'admin'){
        const newProduct = new Product({
            date: new Date(),
            title, 
            price, 
            nodiscountprice, 
            shortdescription, 
            description, 
            category,
            defaultcount,
            enable: true,
            pictures: [file.destination.slice(6) + '/' + file.originalname],
        });
        newProduct.save().then(product => {
            res.redirect(`/products/product-view?id=${newProduct._id}`);
        }).catch(err => console.log(err));
    }
});
router.post('/add-course', ensureAuthenticated, upload.single('picture'), (req, res, next) => {
    const file = req.file;
    var {title, price, nodiscountprice, shortdescription, description, teacherID, type, category, sessions, capacity, hours, minutes} = req.body;
    var sessionContents = [];
    for(var i=0; i<sessions; i++) sessionContents.push({title: '', hours: 0, minutes: 0, description: '', type: 'locked', file: ''});

    if (!file) {
        res.send('no file to upload');
    }
    else if(req.user.role == 'admin'){
        Teacher.findById(teacherID, (err, teacher) => {
            const newCourse = new Course({
                date: new Date(),
                title, price, nodiscountprice, shortdescription, description, teacherID, type, category, sessions, capacity,
                teacher: teacher.firstName + ' ' + teacher.lastName,
                totalTime: {hours, minutes, seconds: 0},
                sessionContents,
                cover: file.destination.slice(6) + '/' + file.originalname,
            });
            newCourse.save().then(course => {
                res.redirect(`/courses/course-view?id=${newCourse._id}`);
            }).catch(err => console.log(err));
        })
    }
});
router.post('/print3d', ensureAuthenticated, upload.single('myfile'), (req, res, next) => {
    const file = req.file;
    console.log(file)
    if (!file) {
        req.flash('error_msg', 'لطفا یک فایل stl انتخاب کنید.');
        res.redirect(`/print3d`);
    }
    else{
        const newPrint3d = new Print3d({
            date: new Date(),
            username: req.user.fullname,
            userID: req.user._id,
            file: file.destination.slice(6) + '/' + file.originalname,
        });
        newPrint3d.save().then(doc => {
            res.redirect(`/print3d/print3d-view?id=${newPrint3d._id}`);
        }).catch(err => console.log(err));
    }
});
router.post('/add-session', ensureAuthenticated, upload.single('picture'), (req, res, next) => {
    const file = req.file;
    var {sessionIndex, courseID, title, hours, minutes, description, type} = req.body;
    Course.findById(courseID, (err, course) => {
        if (!file && course.type != 'مجازی') {
            res.send('no file to upload');
        }
        else if(req.user.role == 'admin'){
            if(course.sessionContents.length != course.sessions){
                course.sessionContents = [];
                for(var i=0; i<course.sessions; i++){
                    course.sessionContents.push({
                        title: '', hours: 0, minutes: 0, description: '', type: 'locked', file: '',
                    });
                }
            }
            var filePath = '';
            if (file) filePath = file.destination.slice(6) + '/' + file.originalname;
            course.sessionContents[sessionIndex] = {
                title, hours, minutes, description, type, file: filePath,
            }
            Course.updateMany({_id: courseID}, {$set: {sessionContents: course.sessionContents}}, (err) => {
                res.redirect(`/courses/course-session?index=${sessionIndex}&id=${courseID}`);
            });
        }
    });
});
router.post('/repair-form-submit', upload.single('picture'), (req, res, next) => {
    const file = req.file;
    var {firstName, lastName, phone, type, address, count} = req.body;
    now = dateConvert.getNow();
    if (!file) {
        res.send('no file to upload');
    }
    else{
        RepairOrder.find({}, (err, orders) => {
            var code = `${now.year}${now.month}${now.day}001`;
            if(orders.length > 0){
                code = `${now.year}${now.month}${now.day}` + (parseInt(orders[orders.length-1].code.slice(-3)) + 1).toString();
            }
            var fullname = firstName + ' ' + lastName;
            var newOrder = new RepairOrder({
                firstName, 
                lastName, 
                fullname,
                phone, 
                type, 
                address, 
                picture: file.destination.slice(6) + '/' + file.originalname,
                code,
                date: now,
                count,
            });
            sms('09380982537', `ثبت سفارش جدید توسط ${fullname} \n\n${count} عدد پاور سوئیچینگ ${type}\nکد پیگیری: ${code} \n\nTehran Instruments \nteinco.ir`)
            sms('09336448037', `ثبت سفارش جدید توسط ${fullname} \n\n${count} عدد پاور سوئیچینگ ${type}\nکد پیگیری: ${code} \n\nTehran Instruments \nteinco.ir`)
            sms(phone, `${fullname} عزیز \n\n سفارش شما با موفقیت ثبت شد.\nکد پیگیری: ${code} \n\nلطفا قطعات خود را جهت تعمیر در ساعات اداری به آدرس زیر ارسال نمایید. \n\nخیابان 15 خرداد، نرسیده به چهارراه گلوبندک، کوچه شهید بادامچی، بن بست حمام تابش، پلاک 1 \nپیگیری سفارش: rrlco.ir/elecrepair/repair-order?orderID=${newOrder._id} \n\nTehran Instruments \nteinco.ir`)
            newOrder.save().then(doc => {
                res.redirect(`/elecrepair/repair-order?orderID=${newOrder._id}`)
            }).catch(err => console.log(err));
        });
    }
});
router.post('/add-product-photo', upload.single('picture'), (req, res, next) => {
    const file = req.file;
    const { id } = req.body;
    if (!file) {
        res.send('no file to upload');
    }
    else if(req.user.role == 'admin'){
        Product.findById(id, (err, product) => {
            product.pictures.push(file.destination.slice(6) + '/' + file.originalname);
            product.save().then(doc => {
                req.flash('success_msg', 'تصویر به محصول اضافه شد.');
                res.redirect(`/products/product-view?id=${id}`);
            }).catch(err => console.log(err));
        });
    }
});
router.post('/add-product-datasheet', upload.single('datasheet'), (req, res, next) => {
    const file = req.file;
    const { id } = req.body;
    if (!file) {
        res.send('no file to upload');
    }
    else if(req.user.role == 'admin'){
        Product.findById(id, (err, product) => {
            product.datasheet = file.destination.slice(6) + '/' + file.originalname;
            product.save().then(doc => {
                req.flash('success_msg', 'دیتاشیت به محصول اضافه شد.');
                res.redirect(`/products/product-view?id=${id}`);
            }).catch(err => console.log(err));
        });
    }
});
router.post('/add-teacher', ensureAuthenticated, upload.single('picture'), (req, res, next) => {
    const file = req.file;
    var {firstName, lastName, title, description, address, website, phone, telegram, instagram, email, age, experienceYears, numOfCourses, lastUpdate} = req.body;

    if (!file) {
        res.send('no file to upload');
    }
    else if(req.user.role == 'admin'){
        const newTeacher = new Teacher({
            date: new Date(),
            firstName, lastName, title, description, address, website, phone, telegram, instagram, email, age, experienceYears, numOfCourses, lastUpdate,
            fullname: firstName + ' ' + lastName,
            cover: file.destination.slice(6) + '/' + file.originalname,
        });
        newTeacher.save().then(teacher => {
            res.redirect(`/teachers/teacher-view?id=${newTeacher._id}`);
        }).catch(err => console.log(err));
    }
});

router.post('/blog-upload-image', ensureAuthenticated, upload.single('file'), (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Return the image URL in the format Froala expects
    const imageUrl = `${req.file.destination.slice(6)}/${req.file.originalname}`;
    res.json({ link: imageUrl });
});
router.post('/admin-blog-create', ensureAuthenticated, upload.single('coverImage'), (req, res, next) => {
    console.log(req.body);
    const file = req.file;
    if (!file) {
        res.send('no file to upload');
        return;
    }
    if(req.user.role == 'admin'){
        var {title, content, shortDescription, author, category, tags} = req.body;
        if(!title || !content){
            req.flash('error_msg', 'لطفا تمام فیلدها را پر کنید.');
            res.redirect('/dashboard/admin-blog');
        }else{
            var newBlogpost = new Blogpost({
                title,
                content,
                shortDescription,
                author,
                category,
                tags,
                coverImage: file.destination.slice(6) + '/' + file.originalname,
            });
            newBlogpost.save().then(blogpost => {
                req.flash('success_msg', 'بلاگ با موفقیت ایجاد شد.');
                res.redirect(`/blog/blog-view?id=${newBlogpost._id}`);
            }).catch(err => console.log(err));
        }
    }else res.render('./error');
});
module.exports = router;