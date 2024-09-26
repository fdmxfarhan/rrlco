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
const {productCategories, coursetypes, courseCategories} = require('../config/consts');
const RepairOrder = require('../models/RepairOrder');


router.get('/', (req, res, next) => {
    res.render('./elecrepair/repair-form', {
        theme: req.session.theme,
        user: req.user,
    });
});
router.get('/repair-order', (req, res, next) => {
    var {orderID} = req.query;
    RepairOrder.findById(orderID, (err, order) => {
        res.render('./elecrepair/order-view', {
            theme: req.session.theme,
            user: req.user,
            order,
            dot,
        });
    })
});

module.exports = router;
