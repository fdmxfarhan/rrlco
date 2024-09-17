var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
const bcrypt = require('bcryptjs');
const mail = require('../config/mail');
const sms = require('../config/sms');
const gencode = require('../config/gencode');
const passport = require('passport');

router.get('/register', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('register');
});
router.get('/login', (req, res, next) => {
    if(req.user)
        res.redirect('/dashboard');
    else
        res.render('login');
});
router.post('/register', (req, res, next) => {
    const { firstName, lastName, phone, email, password, configpassword, address } = req.body;
    const role = 'user', card = 0;
    const ipAddress = req.connection.remoteAddress;
    let errors = [];
    /// check required
    if(!firstName || !lastName || !phone || !email || !password || !configpassword || !address){
        errors.push({msg: 'لطفا موارد خواسته شده را کامل کنید!'});
    }
    /// check password match
    if(password !== configpassword){
        errors.push({msg: 'تایید رمز عبور صحیح نمیباشد!'});
    }
    /// check password length
    if(password.length < 4){
        errors.push({msg: 'رمز عبور شما بسیار ضعیف میباشد!'});
    }
    ///////////send evreything 
    if(errors.length > 0 ){
        res.render('register', { firstName, lastName, phone, email, errors});
    }
    else{
        const fullname = firstName + ' ' + lastName;
        // validation passed
        User.findOne({$or: [{ email: email}, {phone: phone}]})
            .then(user =>{
            if(user){
                // user exist
                errors.push({msg: 'ایمیل یا شماره تلفن قبلا ثبت شده است.'});
                res.render('register', { firstName, lastName, phone, email, errors, address });
            }
            else {
                const newUser = new User({ipAddress, fullname, firstName, lastName, phone, email, password, role, card, address});
                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save().then(user => {
                        sms('09336448037', `ثبت نام کاربر جدید:\n ${fullname}\n ${phone}`);
                        sms(phone, 'به مرکز تحقیقات رباتیک و برنامه نویسی خوش آمدید.\n https://rrlco.ir')
                        req.flash('success_msg', 'ثبت نام با موفقیت انجام شد. اکنون میتوانید وارد شوید.');
                        res.redirect('/users/login');
                    }).catch(err => console.log(err));
                }));
                console.log(newUser);
            }
        });
    }  
});
router.post('/login', function(req, res, next){
    const { username, password} = req.body;
    let errors = [];
    /// check required
    if(!username || !password){
      errors.push({msg: 'لطفا موارد خواسته شده را کامل کنید!'});
    }
    if(errors.length > 0 ){
      res.render('login', { errors, username, password});
    }
    passport.authenticate('local', {
      successRedirect: '/dashboard?login=true',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
});
router.get('/logout', function(req, res, next){
    req.logOut((err) => {
        req.flash('success_msg', 'شما با موفقیت خارج شدید');
        res.redirect('/users/login');
    });
});

module.exports = router;
