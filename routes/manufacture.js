var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Course = require('../models/Course');
const mail = require('../config/mail');
const dot = require('../config/dot');
const sms = require('../config/sms');
const timedigit = require('../config/timedigit');
const { productCategories, coursetypes, courseCategories } = require('../config/consts');
const RepairOrder = require('../models/RepairOrder');

router.get('/', (req, res, next) => {
    res.render('./manufacture/products', {
        theme: req.session.theme,
        user: req.user,
        products: [],
        productCategories,
    });
});

module.exports = router;
