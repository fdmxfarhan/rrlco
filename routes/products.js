var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
const mail = require('../config/mail');
const dot = require('../config/dot');
const {productCategories} = require('../config/consts');
const searchText = require('../config/searchText');
const bcrypt = require('bcryptjs');
const sms = require('../config/sms');
const passport = require('passport');


router.get('/', (req, res, next) => {
    var { category } = req.query;
    Product.find({enable: true}, (err, products) => {
        if(category) products = products.filter((e) => e.category == category);
        products.sort((a, b) => b.weight - a.weight);
        res.render('./products/products', {
            theme: req.session.theme,
            user: req.user,
            products,
            productCategories,
            dot,
            category,
        });
    });
});
router.get('/product-view', (req, res, next) => {
    var productID = req.query.id;
    Product.findById(productID, (err, product) => {
        if(product){
            res.render('./products/product-view', {
                theme: req.session.theme,
                user: req.user,
                product,
                productCategories,
                dot,
            });
        } else res.send('product not found');
    })
});
router.get('/edit-product', ensureAuthenticated, (req, res, next) => {
    var productID = req.query.id;
    if(req.user.role == 'admin'){
        Product.findById(productID, (err, product) => {
            res.render('./products/edit-product', {
                theme: req.session.theme,
                user: req.user,
                product,
                productCategories,
                dot,
            });
        });
    }
    else res.render('./error');
});
router.get('/enable-product', ensureAuthenticated, (req, res, next) => {
    var productID = req.query.id;
    if(req.user.role == 'admin'){
        Product.updateMany({_id: productID}, {$set: {enable: true}}, (err, product) => {
            res.redirect(`/products/product-view?id=${productID}`);
        });
    }
    else res.render('./error');
});   
router.get('/disable-product', ensureAuthenticated, (req, res, next) => {
    var productID = req.query.id;
    if(req.user.role == 'admin'){
        Product.updateMany({_id: productID}, {$set: {enable: false}}, (err, product) => {
            res.redirect(`/products/product-view?id=${productID}`);
        });
    }
    else res.render('./error');
});    
router.get('/delete-product', ensureAuthenticated, (req, res, next) => {
    var productID = req.query.id;
    if(req.user.role == 'admin'){
        Product.deleteOne({_id: productID}, (err) => {
            res.redirect(`/products`);
        });
    }
    else res.render('./error');
});   
router.post('/edit-product', ensureAuthenticated, (req, res, next) => {
    var {id, title, price, nodiscountprice, shortdescription, description, category, defaultcount, available, weight} = req.body;
    if (available == 'true') available = true;
    else  available = false;
    if(req.user.role == 'admin'){
        Product.updateMany({_id: id}, {title, price, nodiscountprice, shortdescription, description, category, weight, defaultcount, available}, (err, doc) => {
            res.redirect(`/products/product-view?id=${id}`);
        });
    }
});   
router.get('/delete-product-picture', ensureAuthenticated, (req, res, next) => {
    var {id, index} = req.query;
    if(req.user.role == 'admin'){
        Product.findById(id, (err, product) => {
            product.pictures.splice(index, 1);
            product.save().then(doc => {
                req.flash('success_msg', 'تصویر حذف شد.');
                res.redirect(`/products/product-view?id=${id}`);
            }).catch(err => console.log(err));
        })
    } else res.send('access denied!!');
});
router.post('/search', (req, res, next) => {
    var { word } = req.body;
    Product.find({enable: true}, (err, allProducts) => {
        var products = [];
        for(var i=0; i < allProducts.length; i++){
            if(searchText(allProducts[i].title, word) || searchText(allProducts[i].description, word)){
                products.push(allProducts[i]);
            }
        }
        res.render('./products/products', {
            theme: req.session.theme,
            user: req.user,
            products,
            productCategories,
            dot,
            word,
        });
    });
});
router.post('/register-and-addtocart', (req, res, next) => {
    var {productID, firstName, lastName, phone, email, address, password, configpassword} = req.body;
    const ipAddress = req.connection.remoteAddress;
    const role = 'user', card = 0;
    const fullname = firstName + ' ' + lastName;
    let errors = [];
    User.findOne({$or: [{ email: email}, {phone: phone}]}, (err, user) => {
        if(user){
            errors.push({msg: 'ایمیل یا شماره تلفن قبلا ثبت شده است.'});
            res.render('register', { firstName, lastName, phone, email, errors, address });
        }
        else {
            Product.findById(productID, (err, product) => {
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
                    shoppingcart: [{
                        item: product,
                        count: 1,
                        type: 'product',
                    }]
                });
                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
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
                            res.redirect('/dashboard/shopping-cart');
                        });
                    }).catch(err => console.log(err));
                }));
            })
        }
    })
});
router.get('/remove-home-product', ensureAuthenticated, (req, res, next) => {
    var {id} = req.query;
    Product.updateMany({_id: id}, {$set: {showHome: false}}, (err, doc) => {
        req.flash('success_msg', 'محصول از صفحه اصلی حذف شد.');
        res.redirect(`/products/product-view?id=${id}`);
    })
});
router.get('/add-home-product', ensureAuthenticated, (req, res, next) => {
    var {id} = req.query;
    Product.updateMany({_id: id}, {$set: {showHome: true}}, (err, doc) => {
        req.flash('success_msg', 'محصول از صفحه اصلی حذف شد.');
        res.redirect(`/products/product-view?id=${id}`);
    })
});

module.exports = router;
