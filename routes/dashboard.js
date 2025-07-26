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
const {coursetypes, courseCategories, productCategories, cities} = require('../config/consts')
const dateConvert = require('../config/dateConvert');
const Discount = require('../models/Discount');
const Order = require('../models/Order');
const { cart_total_price, cart_discount, orderStateNum, nextOrderState, orderNum2State, prevOrderState, get_tax } = require('../config/order');
const Animalfeeder = require('../models/Animalfeeder');
const { IPinfoWrapper } = require("node-ipinfo");
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

const ipinfo = new IPinfoWrapper("f29841994da430");

router.get('/checkvpn', (req, res, next) => {
    var ip = req.ip.split(':').pop();
    if(ip == '1') ip = '127.0.0.1';
    console.log(ip)
    ipinfo.lookupIp(ip).then((response) => {
        console.log(response);
        // res.send(response)
    });
});

// sms('09336448037', 'server is started !!');

router.get('/', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'user')
    {
        var coursesList = req.user.courses;
        var coursesID = coursesList.map(item => item.id);
        Course.find({_id: {$in: coursesID}}, (err, courses) => {
            Order.find({ownerID: req.user._id, compeleted: false}, (err, orders) => {
                orders.reverse();
                res.render('./dashboard/user-dashboard', {
                    theme: req.session.theme,
                    user: req.user,
                    orders,
                    dateConvert,
                    dot,
                    orderStateNum,
                    courses,
                    timedigit,
                });
            })
        })
    }
    else if(req.user.role == 'admin')
    {
        Order.find({compeleted: false, payed: true}, (err, orders) => {
            Product.countDocuments({}).then((numOfProduct) => {
                Course.countDocuments({}).then((numOfCourse) => {
                    Order.countDocuments({}).then((numOfOrder) => {
                        orders.reverse();
                        res.render('./dashboard/admin-dashboard', {
                            theme: req.session.theme,
                            user: req.user,
                            orders,
                            dateConvert,
                            dot,
                            orderStateNum,
                            numOfProduct,
                            numOfCourse,
                            numOfOrder,
                        });
                    });
                });
            })
        });
    }
});
router.get('/admin-users', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
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
    if(req.user.role == 'admin'){
        Product.find({}, (err, products) => {
            products.sort((a, b) => b.weight - a.weight);
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
    if(req.user.role == 'admin'){
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
    if(req.user.role == 'admin'){
        res.render('./dashboard/admin-add-product', {
            theme: req.session.theme,
            user: req.user,
            productCategories,
        });
    }
    else res.render('./error');
});
router.get('/add-course', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Teacher.find({}, (err, teachers) => {
            res.render('./dashboard/admin-add-course', {
                theme: req.session.theme,
                user: req.user,
                coursetypes,
                courseCategories,
                teachers,
            });
        })
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
                shoppingcart.push({item: course, type, count: 1});
                User.updateMany({_id: req.user._id}, {$set: {shoppingcart}}, (err, doc) => {
                    req.flash('success_msg', 'به سبد خرید اضافه شد');
                    res.redirect(`/dashboard/shopping-cart`);
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
                    res.redirect(`/dashboard/shopping-cart`);
                    // res.redirect(`/products/product-view?id=${product._id}`);
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
                    res.redirect(`/dashboard/shopping-cart`);
                });
            })
        })
    }
});
router.get('/shopping-cart', ensureAuthenticated, (req, res, next) => {
    var totalPrice = 0, discount = 0, tax = 0;
    totalPrice = cart_total_price(req.user.shoppingcart);
    tax = get_tax(req.user.shoppingcart);
    Discount.findById(req.user.currentdicount, (err, currentdicount) => {
        if(currentdicount) discount = cart_discount(currentdicount, req.user.shoppingcart);
        res.render('./dashboard/shopping-cart', {
            theme: req.session.theme,
            user: req.user,
            dot,
            totalPrice,
            discount,
            tax,
            currentdicount,
        });
    })
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
    User.updateMany({_id: req.user._id}, {$set: {firstName, lastName, phone, email, address, fullname: firstName + ' ' + lastName}}, (err, doc) => {
        req.flash('success_msg', 'تغییرات ثبت شد.');
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
router.post('/apply-discount-tocart', ensureAuthenticated, (req, res, next) => {
    var { discountnumber } = req.body;
    Discount.findOne({code: discountnumber}, (err, discount) => {
        if(discount){
            var totalPrice = cart_total_price(req.user.shoppingcart);
            if(discount.userID == 'all' || discount.userID == req.user._id){
                if(totalPrice > discount.minPurchase){
                    User.updateMany({_id: req.user._id}, {$set: {currentdicount: discount._id}}, (err, doc) => {
                        req.flash('success_msg', `کد تخفیف ${discount.code} اضافه شد.`);
                        res.redirect('/dashboard/shopping-cart');    
                    });
                }else{
                    req.flash('error_msg', `حداقل خرید مجاز ${dot(discount.minPurchase)} تومان می‌باشد.`);
                    res.redirect('/dashboard/shopping-cart');    
                }
            }else{
                req.flash('error_msg', 'این کد تخفیف برای شما تعریف نشده.');
                res.redirect('/dashboard/shopping-cart');
            }
        }else{
            req.flash('error_msg', 'کد تخفیف یافت نشد.');
            res.redirect('/dashboard/shopping-cart');
        }
    })
});   
router.get('/remove-discount-from-cart', ensureAuthenticated, (req, res, next) => {
    const previousUrl = req.get('referer'); 
    User.updateMany({_id: req.user._id}, {$set: {currentdicount: {_id: ''}}}, (err) => {
        req.flash('success_msg', `کد تخفیف حذف شد.`);
        res.redirect(previousUrl);
    });
});
router.get('/compelete-order', ensureAuthenticated, (req, res, next) => {
    var totalPrice = 0, discount = 0, tax=0, deliveryPrice = 0;
    if(req.user.shoppingcart.length > 0){
        totalPrice = cart_total_price(req.user.shoppingcart);
        tax = get_tax(req.user.shoppingcart);
        Discount.findById(req.user.currentdicount, (err, currentdicount) => {
            if(currentdicount) discount = cart_discount(currentdicount, req.user.shoppingcart);
            res.render('./dashboard/compelete-order', {
                theme: req.session.theme,
                user: req.user,
                dot,
                totalPrice,
                discount,
                tax,
                currentdicount,
                cities,
                deliveryPrice,
            });
        });
    }else{
        req.flash('error_msg', 'سبد خرید شما خالی است.');
        res.redirect('/dashboard/shopping-cart');
    }
});
router.post('/compelete-order', ensureAuthenticated, (req, res, next) => {
    var {city, postCode, delivery, phone, address, description} = req.body;
    if(!city || !postCode || !delivery || !phone || !address){
        req.flash('error_msg', 'لطفا تمام فیلدها را پر کنید.');
        res.redirect('/dashboard/compelete-order');
    }
    else if(postCode.length != 10){
        req.flash('error_msg', 'کد پستی صحیح نمی‌باشد.');
        res.redirect('/dashboard/compelete-order');
    }
    else if(req.user.shoppingcart.length == 0){
        req.flash('error_msg', 'سبد خرید شما خالی است.');
        res.redirect('/dashboard')
    }
    else{
        var totalPrice = 0, discount = 0, tax=0, deliveryPrice = 60000;
        totalPrice = cart_total_price(req.user.shoppingcart);
        tax = get_tax(req.user.shoppingcart);
        Discount.findById(req.user.currentdicount, (err, currentdicount) => {
            var discountID = '';
            if(currentdicount) {
                discount = cart_discount(currentdicount, req.user.shoppingcart);
                discountID = currentdicount._id;
            }
            if(delivery == 'پیک موتوری') deliveryPrice = 0;
            var newOrder = new Order({
                ownerID: req.user._id,
                ownerNmae: req.user.fullname,
                items: req.user.shoppingcart,
                description,
                totalPrice,
                discount,
                tax,
                deliveryPrice, ////////////////////////////////
                discountID,
                delivery,
                city,
                postCode,
                address,
                phone,
                payed: false,
                compeleted: false,
                state: 'در انتظار پرداخت',
                date: new Date(),
            });
            newOrder.save().then(discount => {
                User.updateMany({_id: req.user._id}, {$set: {shoppingcart: []}}, (err, doc) => {
                    sms('09336448037', `ثبت سفارش جدید:\nکاربر: ${req.user.fullname}\nتلفن: ${req.user.phone}`);
                    sms(req.user.phone, `سفارش شما با موفقیت ثبت شد.\n\nمرکز تحقیقات رباتیک.\nhttps://rrlco.ir/courses`);
                    res.redirect(`/payment/pay-order?id=${newOrder._id}`);
                });
            }).catch(err => console.log(err));
        });
    }
});
router.get('/remove-order', ensureAuthenticated, (req, res, next) => {
    var orderID = req.query.id;
    if(req.user.role == 'admin'){
        Order.deleteOne({_id: orderID}, (err) => {
            req.flash('success_msg', 'سفارش حذف شد.');
            res.redirect(`/dashboard/admin-orders`);
        });
    }
    else{
        Order.findById(orderID, (err, order) => {
            if(order.ownerID == req.user._id){
                Order.deleteOne({_id: orderID}, (err) => {
                    req.flash('success_msg', 'سفارش حذف شد.');
                    res.redirect(`/dashboard`);
                });
            }
            else res.send('Access Denied!!!')
        });
    }
});
router.get('/courses', ensureAuthenticated, (req, res, next) => {
    var coursesList = req.user.courses;
    var coursesID = coursesList.map(item => item.id);
    Course.find({_id: {$in: coursesID}}, (err, courses) => {
        res.render('./dashboard/user-courses', {
            theme: req.session.theme,
            user: req.user,
            coursetypes,
            courseCategories,
            courses,
            dot,
            timedigit,
        });
    });
});
router.get('/admin-order-prev', ensureAuthenticated, (req, res, next) => {
    var orderID = req.query.id;
    if(req.user.role == 'admin'){
        Order.findById(orderID, (err, order) => {
            Order.updateMany({_id: orderID}, {$set: {state: prevOrderState(order.state)}}, (err, doc) => {
                req.flash('success_msg', 'تغییرات با موفقیت ثبت شد.');
                res.redirect('/dashboard');
            })
        });
    }
});
router.get('/admin-order-next', ensureAuthenticated, (req, res, next) => {
    var orderID = req.query.id;
    if(req.user.role == 'admin'){
        Order.findById(orderID, (err, order) => {
            order.state = nextOrderState(order.state);
            if(order.state == 'تکمیل شده'){
                Order.updateMany({_id: orderID}, {$set: {state: order.state, compeleted: true}}, (err, doc) => {
                    sms(order.phone, 'سفارش شما ارسال شد.\nسپاس از اعتماد شما.\n\nمرکز تحقیقات رباتیک.\nhttps://rrlco.ir/products')
                    req.flash('success_msg', 'تغییرات با موفقیت ثبت شد.');
                    res.redirect('/dashboard');
                })
            }else{
                Order.updateMany({_id: orderID}, {$set: {state: order.state}}, (err, doc) => {
                    req.flash('success_msg', 'تغییرات با موفقیت ثبت شد.');
                    res.redirect('/dashboard');
                })
            }
        });
    }
});
router.get('/admin-orders', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Order.find({}, (err, orders) => {
            orders.reverse();
            res.render('./dashboard/admin-orders', {
                theme: req.session.theme,
                user: req.user,
                orders,
                dateConvert,
                dot,
                orderStateNum,
            });
        })
    }
});
router.get('/orders', ensureAuthenticated, (req, res, next) => {
    Order.find({ownerID: req.user._id}, (err, orders) => {
        orders.reverse();
        res.render('./dashboard/user-orders', {
            theme: req.session.theme,
            user: req.user,
            orders,
            dateConvert,
            dot,
            orderStateNum,
        });
    })
});
router.get('/admin-animalfeeder', ensureAuthenticated, (req, res, next) => {
    Animalfeeder.find({}, (err, animalfeeders) => {
        res.render('./dashboard/admin-animalfeeder', {
            theme: req.session.theme,
            user: req.user,
            animalfeeders,
            dateConvert,
            dot,
            orderStateNum,
        });
    })
});
router.post('/admin-add-animalfeeder', ensureAuthenticated, (req, res, next) => {
    var {id, fullname, phone, password} = req.body;
    Animalfeeder.findOne({id}, (err, feeder) => {
        if(feeder){
            req.flash('error_msg', 'این ID قبلا ثبت شده.');
            res.redirect('/dashboard/admin-animalfeeder');
        }else{
            var newFeeder = new Animalfeeder({
                id,
                fullname,
                phone,
                password,
                date: dateConvert.getNow(),
            })
            newFeeder.save().then(doc => {
                req.flash('success_msg', 'دستگاه با موفقیت ثبت شد.');
                res.redirect('/dashboard/admin-animalfeeder');
            }).catch(err => console.log(err));
        }
    });
});
router.get('/delete-user', ensureAuthenticated, (req, res, next) => {
    var {userID} = req.query;
    if(req.user.role == 'admin'){
        User.deleteOne({_id: userID}, (err) => {
            res.redirect(`/dashboard/admin-users`);
        });
    }
    else res.render('./error')
}); 
router.get('/admin-sms', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.find({}, (err, users) => {
            res.render('./dashboard/admin-sms', {
                theme: req.session.theme,
                user: req.user,
                dateConvert,
                dot,
                users,
            });
        })
    }else res.send('Access Denied!!');
}); 
router.post('/admin-sms', ensureAuthenticated, (req, res, next) => {
    var {target, text} = req.body;
    if(req.user.role == 'admin'){
        sms(target, text);
        req.flash('success_msg', 'پیام با موفقیت ارسال شد.');
        res.redirect('/dashboard/admin-sms');
    }else res.send('access denied!!');
}); 
router.post('/admin-change-pass', ensureAuthenticated, (req, res, next) => {
    var {userID, password} = req.body;
    if(req.user.role == 'admin'){
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
            User.updateMany({_id: userID}, {$set: {password: hash}}, (err, doc) => {
                req.flash('success_msg', 'تغییر کلمه عبور انجام شد.');
                res.redirect('/dashboard/admin-users');
            })
        }));
    }
}); 
router.get('/admin-user-cart', ensureAuthenticated, (req, res, next) => {
    var {userID} = req.query;
    var totalPrice = 0, discount = 0, tax = 0;
    if(req.user.role == 'admin'){
        User.findById(userID, (err, user) => {
            totalPrice = cart_total_price(user.shoppingcart);
            tax = get_tax(user.shoppingcart);
            Discount.findById(user.currentdicount, (err, currentdicount) => {
                if(currentdicount) discount = cart_discount(currentdicount, user.shoppingcart);
                Product.find({}, (err, products) => {
                    res.render('./dashboard/admin-user-cart', {
                        theme: req.session.theme,
                        user: req.user,
                        dot,
                        totalPrice,
                        discount,
                        tax,
                        currentdicount,
                        shoppingcart: user.shoppingcart,
                        products,
                        userID,
                    });
                })
            })
        })
    }
});
router.post('/admin-add-product-to-user-cart', ensureAuthenticated, (req, res, next) => {
    var {userID, productID, count} = req.body;
    if(count) count = parseInt(count);
    var type = 'product';
    if(req.user.role == 'admin'){
        User.findById(userID, (err, user) => {
            var shoppingcart = user.shoppingcart
            Product.findById(productID, (err, product) => {
                var already_exist = false;
                for(var i=0; i<shoppingcart.length; i++){
                    if(shoppingcart[i].item._id == productID){
                        shoppingcart[i].count = parseInt(shoppingcart[i].count) + count;
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
                User.updateMany({_id: userID}, {$set: {shoppingcart}}, (err, doc) => {
                    req.flash('success_msg', 'به سبد خرید اضافه شد');
                    res.redirect(`/dashboard/admin-user-cart?userID=${userID}`);
                });
            });
        })
    }
});
router.get('/admin-delete-item-cart', ensureAuthenticated, (req, res, next) => {
    var {index, userID} = req.query;
    User.findById(userID, (err, user) => {
        var shoppingcart = user.shoppingcart;
        shoppingcart.splice(index, 1);
        User.updateMany({_id: userID}, {$set: {shoppingcart}}, (err, doc) => {
            res.redirect(`/dashboard/admin-user-cart?userID=${userID}`);
        });
    });
});
router.get('/admin-user-view', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        var {userID} = req.query;
        User.findById(userID, (err, viewingUser) => {
            res.render('./dashboard/admin-user-view', {
                theme: req.session.theme,
                user: req.user,
                viewingUser,
            });
        });
    }else res.send('access denied!!');
});
router.get('/admin-teachers', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Teacher.find({}, (err, teachers) => {
            res.render('./dashboard/admin-teachers', {
            theme: req.session.theme,
                user: req.user,
                teachers,
                dot,
                timedigit,
            });
        })
    }
    else res.render('./error');
});
router.get('/add-teacher', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        res.render('./dashboard/admin-add-teacher', {
            theme: req.session.theme,
            user: req.user,
        });
    }
    else res.render('./error');
});

module.exports = router;
