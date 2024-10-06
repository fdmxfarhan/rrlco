var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
const mail = require('../config/mail');
const dot = require('../config/dot');
const {productCategories} = require('../config/consts')


router.get('/', (req, res, next) => {
    var { category } = req.query;
    Product.find({enable: true}, (err, products) => {
        if(category) products = products.filter((e) => e.category == category);
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
    req.flash('success_msg', 'به سبد خرید اضافه شد');
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
    var {id, title, price, nodiscountprice, shortdescription, description, category, defaultcount, available} = req.body;
    if (available == 'true') available = true;
    else  available = false;
    if(req.user.role == 'admin'){
        Product.updateMany({_id: id}, {title, price, nodiscountprice, shortdescription, description, category, defaultcount, available}, (err, doc) => {
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
module.exports = router;
