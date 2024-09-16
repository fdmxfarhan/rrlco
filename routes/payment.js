var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
const ZarinpalCheckout = require('zarinpal-checkout');
const Order = require('../models/Order');
const Course = require('../models/Course');
const zarinpal = ZarinpalCheckout.create('8cf5f8c4-4e56-4851-8a42-7708e49bdd98', false);

// Docs: https://www.npmjs.com/package/zarinpal-checkout

router.get('/', (req, res, next) => {
  zarinpal.PaymentRequest({
      Amount: '5000', // In Tomans
      CallbackURL: 'https://rrlco.ir/payment/payment-call-back',
      Description: 'A Payment from Node.JS',
      Email: 'hi@siamak.work',
      Mobile: '09120000000'

    }).then(response => {
      if (response.status === 100) {
        console.log(response);
        // response.authority should be saved
        res.redirect(response.url);
      }
    }).catch(err => {
      console.error(err);
    });
});
router.get('/payment-call-back', (req, res, next) => {
    // req.query.Authority should be checked
    if(req.query.Status == 'OK'){

    }else{
        console.log(req.query);
        res.send(req.query);
    }
    
});
router.get('/pay-order', (req, res, next) => {
    var orderID = req.query.id;
    Order.findById(orderID, (err, order) => {
        zarinpal.PaymentRequest({
            Amount: order.totalPrice + order.deliveryPrice + order.tax - order.discount, // In Tomans
            CallbackURL: 'https://rrlco.ir/payment/order-payment-call-back',
            Description: `پرداخت سفارش کاربر ${req.user.fullname}`,
            Email: req.user.email,
            Mobile: req.user.phone,
        }).then(response => {
            if (response.status === 100) {
                Order.updateMany({_id: orderID}, {$set: {paymentAuthority: response.authority}}, (err, doc) => {
                    console.log(response);
                    res.redirect(response.url);
                });
            }
        }).catch(err => {
            console.error(err);
        });
    })
});
router.get('/order-payment-call-back', (req, res, next) => {
    // req.query.Authority should be checked
    console.log(req.query);
    if(req.query.Status == 'OK'){
        Order.updateMany({paymentAuthority: req.query.Authority}, {$set: {payed: true, state: 'در حال پردازش'}}, (err, order) => {
            req.flash('success_msg', 'پرداخت با موفقیت انجام شد');
            res.redirect('/dashboard');
        });
    }else{
        req.flash('error_msg', 'پرداخت انجام نشد');
        res.redirect('/dashboard');
    }
});
router.get('/pay-online-course', (req, res, next) => {
    if(!req.user.payableCourse) res.send('no payable course found!!');
    else{
        payableCourse = req.user.payableCourse;
        Course.findById(payableCourse.id, (err, course) => {
            zarinpal.PaymentRequest({
                Amount: course.price, // In Tomans
                CallbackURL: 'https://rrlco.ir/payment/online-course-payment-call-back',
                Description: `پرداخت دوره آنلاین ${req.user.fullname}`,
                Email: req.user.email,
                Mobile: req.user.phone,
            }).then(response => {
                if (response.status === 100) {
                    User.updateMany({_id: req.user._id}, {$set: {paymentAuthority: response.authority}}, (err, doc) => {
                        console.log(response);
                        res.redirect(response.url);
                    });
                }
            }).catch(err => {
                console.error(err);
            });
        })
    }
});
router.get('/online-course-payment-call-back', (req, res, next) => {
    // req.query.Authority should be checked
    console.log(req.query);
    if(req.query.Status == 'OK'){
        var payableCourse = req.user.payableCourse;
        var courses = req.user.courses;
        payableCourse.payed = true;
        payableCourse.auth = req.query.Authority;
        courses.push(payableCourse)
        User.updateMany({paymentAuthority: req.query.Authority}, {$set: {courses}}, (err, doc) => {
            req.flash('success_msg', 'پرداخت با موفقیت انجام شد');
            res.redirect(`/courses/course-view?id=${payableCourse.id}`);
        });
    }else{
        req.flash('error_msg', 'پرداخت انجام نشد');
        res.redirect('/dashboard');
    }
});

module.exports = router;




/*
router.get('/pay-estate', (req, res, next) => {
    var {username, password, plan} = req.query;
    amounts = [170000, 470000, 680000, 1469000];
    names = ['1 ماهه', '3 ماهه', '6 ماهه', '1 ساله'];
    Settings.findOne({}, (err, settings) => {
        amounts = [settings.oneMonth, settings.threeMonth, settings.sixMonth, settings.oneYear];
        console.log(amounts);
        Estate.findOne({code: username, password: password}, (err, estate) => {
            if(estate){
                zarinpal.PaymentRequest({
                    Amount: amounts[parseInt(plan)].toString(), // In Tomans
                    CallbackURL: 'http://185.81.99.34:3000/api/payment-call-back',
                    Description: `خرید اشتراک ${names[parseInt(plan)]} توسط ${estate.name}`,
                    Email: '',
                    Mobile: estate.phone
                }).then(response => {
                    if (response.status === 100) {
                        Estate.updateMany({code: username, password: password}, {$set: {
                            authority: response.authority, 
                            planType: names[parseInt(plan)]
                        }}, (err, doc) => {
                            console.log(response);
                            res.redirect(response.url);
                        });
                    }
                }).catch(err => {
                    console.error(err);
                });
            }
            else res.send({status: 'error'});
        });
    });
});
*/