var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
const ZarinpalCheckout = require('zarinpal-checkout');
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
        res.redirect(response.url);
      }
    }).catch(err => {
      console.error(err);
    });
});
router.get('/payment-call-back', (req, res, next) => {
  console.log(req.query);
  res.send(req.query);
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