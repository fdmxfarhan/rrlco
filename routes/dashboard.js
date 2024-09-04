var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
const Print3d = require('../models/Print3d');
const mail = require('../config/mail');
const dot = require('../config/dot');
const sms = require('../config/sms');
const gencode = require('../config/gencode');
const timedigit = require('../config/timedigit');
const genDiscountCode = require('../config/genDiscountCode');
const {coursetypes, courseCategories, productCategories} = require('../config/consts')
const dateConvert = require('../config/dateConvert');
const Discount = require('../models/Discount');


router.get('/', ensureAuthenticated, (req, res, next) => {
    console.log(req.user)
    if(req.user.role == 'user')
    {
        res.render('./dashboard/user-dashboard', {
            theme: req.session.theme,
            user: req.user,
        });
    }
    else if(req.user.role = 'admin')
    {
        res.render('./dashboard/admin-dashboard', {
            theme: req.session.theme,
            user: req.user,
        });
    }
});
router.get('/admin-users', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin'){
        User.find({}, (err, users) => {
            res.render('./dashboard/admin-users', {
            theme: req.session.theme,
                user: req.user,
                users,
            });
        })
    }
    else res.render('./error');
});
router.get('/admin-shop', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin'){
        Product.find({}, (err, products) => {
            res.render('./dashboard/admin-shop', {
            theme: req.session.theme,
                user: req.user,
                products,
                dot
            });
        })
    }
    else res.render('./error');
});
router.get('/admin-courses', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin'){
        Course.find({}, (err, courses) => {
            res.render('./dashboard/admin-courses', {
            theme: req.session.theme,
                user: req.user,
                courses,
                dot,
                timedigit,
            });
        })
    }
    else res.render('./error');
});
router.get('/add-product', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin'){
        res.render('./dashboard/admin-add-product', {
            theme: req.session.theme,
            user: req.user,
            productCategories,
        });
    }
    else res.render('./error');
});
router.get('/add-course', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin'){
        res.render('./dashboard/admin-add-course', {
            theme: req.session.theme,
            user: req.user,
            coursetypes,
            courseCategories,
        });
    }
    else res.render('./error');
});
router.get('/add-to-cart', ensureAuthenticated, (req, res, next) => {
    var {type, id} = req.query;
    var shoppingcart = req.user.shoppingcart;
    if(type == 'course'){
        for(var i=0; i<shoppingcart.length; i++){
            if(shoppingcart[i].item._id == id){
                req.flash('error_msg', 'این دوره در سبد خرید شما موجود است.');
                res.redirect(`/courses/course-view?id=${id}`);
                return;
            }
        }
        Course.findById(id, (err, course) => {
            if(!course.enable){
                req.flash('error_msg', 'این دوره در دسترس نمی‌باشد.');
                res.redirect(`/courses/course-view?id=${course._id}`);
            }else{
                shoppingcart.push({item: course, type});
                User.updateMany({_id: req.user._id}, {$set: {shoppingcart}}, (err, doc) => {
                    req.flash('success_msg', 'به سبد خرید اضافه شد');
                    res.redirect(`/courses/course-view?id=${course._id}`);
                });
            }
        });
    }
});
router.post('/add-to-cart', ensureAuthenticated, (req, res, next) => {
    var {type, id, count} = req.body;
    count = parseInt(count);
    var shoppingcart = req.user.shoppingcart;
    if(type == 'product'){
        Product.findById(id, (err, product) => {
            if(!product.available){
                req.flash('error_msg', 'این محصول موجود نمی‌باشد.');
                res.redirect(`/products/product-view?id=${product._id}`);
            }
            else{
                var already_exist = false;
                for(var i=0; i<shoppingcart.length; i++){
                    if(shoppingcart[i].item._id == id){
                        shoppingcart[i].count += count;
                        already_exist = true;
                    }
                }
                if(!already_exist){
                    shoppingcart.push({
                        item: product,
                        count,
                        type,
                    });
                }
                User.updateMany({_id: req.user._id}, {$set: {shoppingcart}}, (err, doc) => {
                    req.flash('success_msg', 'به سبد خرید اضافه شد');
                    res.redirect(`/products/product-view?id=${product._id}`);
                });
            }
        });
    }else if(type == 'print3d'){
        var {title, filament, colorABS, colorPLA, infill, layerhieght, price} = req.body;
        var color = colorABS;
        if(filament == 'PLA') color = colorPLA;
        Print3d.updateMany({_id: id}, {$set: {title, filament, color, infill, price, layerhieght, date: new Date(), username: req.user.fullname, userID: req.user._id}}, (err, doc) => {
            Print3d.findById(id, (err, print3d) => {
                console.log(print3d);
                shoppingcart.push({
                    item: print3d,
                    count,
                    type,
                });
                User.updateMany({_id: req.user._id}, {$set: {shoppingcart}}, (err, doc) => {
                    req.flash('success_msg', 'به سبد خرید اضافه شد');
                    res.redirect(`/print3d`);
                });
            })
        })
    }
});
router.get('/shopping-cart', ensureAuthenticated, (req, res, next) => {
    var totalPrice = 0, discount = 0, tax=0;
    for(var i=0; i<req.user.shoppingcart.length; i++){
        if(req.user.shoppingcart[i].type == 'product'){
            totalPrice += req.user.shoppingcart[i].count * req.user.shoppingcart[i].item.price;
        }
        if(req.user.shoppingcart[i].type == 'course'){
            totalPrice += req.user.shoppingcart[i].item.price;
        }
    }
    res.render('./dashboard/shopping-cart', {
        theme: req.session.theme,
        user: req.user,
        dot,
        totalPrice,
        discount,
        tax,
    });
});
router.get('/delete-cart', ensureAuthenticated, (req, res, next) => {
    User.updateMany({_id: req.user._id}, {$set: {shoppingcart: []}}, (err, doc) => {
        res.redirect(`/dashboard/shopping-cart`);
    });
});
router.get('/delete-item-cart', ensureAuthenticated, (req, res, next) => {
    var index = parseInt(req.query.index);
    var shoppingcart = req.user.shoppingcart;
    shoppingcart.splice(index, 1);
    User.updateMany({_id: req.user._id}, {$set: {shoppingcart}}, (err, doc) => {
        res.redirect(`/dashboard/shopping-cart`);
    });
});
router.get('/admin-3dfiles', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Print3d.find({}, (err, files) => {
            res.render('./dashboard/admin-3dfiles', {
                theme: req.session.theme,
                user: req.user,
                dot,
                files,
                dateConvert
            });
        });
    }
});
router.get('/confirm-phone', ensureAuthenticated, (req, res, next) => {
    if(req.user.phoneConfirmed){
        req.flash('success_msg', 'شماره شما قبلا تایید شده.');
        res.redirect('/dashboard');
    }else{
        confirmcode = gencode(5);
        console.log(req.user.phone);
        sms(req.user.phone, `کد تایید شما: ${confirmcode}`);
        User.updateMany({_id: req.user._id}, {$set: {confirmcode}}, (err, doc) => {
            res.render('./dashboard/user-confirmphone', {
                theme: req.session.theme,
                user: req.user,
                confirmcode,
            });
        });
    }
});
router.post('/confirm-phone', ensureAuthenticated, (req, res, next) => {
    var {confnum} = req.body;
    if(req.user.confirmcode == confnum){
        User.updateMany({_id: req.user._id}, {$set: {phoneConfirmed: true}}, (err, doc) => {
            req.flash('success_msg', 'تلفن همراه تایید شد.');
            res.redirect('/dashboard');
        });
    }else{
        req.flash('error_msg', 'کد تایید صحیح نمیباشد.');
        res.render('./dashboard/user-confirmphone', {
            theme: req.session.theme,
            user: req.user,
            confirmcode: req.user.confirmcode,
        });
    }
});
router.get('/user-edit', ensureAuthenticated, (req, res, next) => {
    res.render('./dashboard/user-edit', {
        theme: req.session.theme,
        user: req.user,
    });
});
router.post('/user-edit', ensureAuthenticated, (req, res, next) => {
    var {firstName, lastName, phone, email, address } = req.body;
    User.updateMany({_id: req.user._id}, {firstName, lastName, phone, email, address, fullname: firstName + ' ' + lastName}, (err, doc) => {
        req.flash('success_msg', 'به سبد خرید اضافه شد');
        res.redirect('/dashboard/user-edit');
    });
});
router.get('/admin-discount', ensureAuthenticated, (req, res, next) => {
    Discount.find({}, (err, discounts) => {
        User.find({role: 'user'}, (err, users) => {
            res.render('./dashboard/admin-discount', {
                theme: req.session.theme,
                user: req.user,
                users,
                discounts,
                genDiscountCode,
            });
        })
    })
});
router.post('/admin-add-discount', ensureAuthenticated, (req, res, next) => {
    var {code, maxDiscount, minPurchase, numofuse, type, userID, itemtype, amount, day, month, year} = req.body;
    if(req.user.role == 'admin'){
        Discount.findOne({code}, (err, discount) => {
            if(discount){
                req.flash('error_msg', 'کد تخفیف قبلا ثبت شده');
                res.redirect(`/dashboard/admin-discount`);
            }else{
                var newDiscount = new Discount({
                    code, maxDiscount, minPurchase, numofuse, type, userID, itemtype, amount,
                    date: new Date(),
                    expiredate: {year, month, day}
                });
                newDiscount.save().then(discount => {
                    req.flash('success_msg', 'کد تخفیف اضافه شد.');
                    res.redirect(`/dashboard/admin-discount`);
                }).catch(err => console.log(err));
            }
        })
    }
});
router.get('/delete-discount', ensureAuthenticated, (req, res, next) => {
    var discountID = req.query.id;
    if(req.user.role == 'admin'){
        Discount.deleteOne({_id: discountID}, (err) => {
            res.redirect(`/dashboard/admin-discount`);
        });
    }
    else res.render('./error')
});   

module.exports = router;
