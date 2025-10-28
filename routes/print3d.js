var express = require('express');
var router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
var User = require('../models/User');
var Product = require('../models/Product');
var Print3d = require('../models/Print3d');
const mail = require('../config/mail');
const dot = require('../config/dot');
const {productCategories, print3dCosts, filaments} = require('../config/consts')


router.get('/', (req, res, next) => {
    Product.find({category: 'پرینت سه بعدی'}, (err, products) => {
        res.render('./print3d/print3d', {
            theme: req.session.theme,
            user: req.user,
            dot,
            products,
            dot,
            print3dCosts,
            filaments,
        });
    })
});
router.get('/print3d-view', (req, res, next) => {
    var id = req.query.id;
    Print3d.findById(id, (err, print3d) => {
        res.render('./print3d/print3d-view', {
            theme: req.session.theme,
            user: req.user,
            print3d,
            dot,
            print3dCosts,
            filaments,
        });
    });
});
router.get('/print3d-delete', ensureAuthenticated, (req, res, next) => {
    var print3dID = req.query.id;
    if(req.user.role == 'admin'){
        Print3d.deleteOne({_id: print3dID}, (err) => {
            res.redirect(`/dashboard/admin-3dfiles`);
        });
    }
    else res.render('./error');
});   
module.exports = router;
