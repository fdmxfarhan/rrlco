var express = require('express');
var router = express.Router();
var clock = require('../config/clock');
const { ensureAuthenticated } = require('../config/auth');
const Animalfeeder = require('../models/Animalfeeder');

router.get('/', (req, res, next) => {
    var {id} = req.query;
    if(req.session.petid) id = req.session.petid;
    if(id){
        req.session.petid = id;
        Animalfeeder.findOne({id}, (err, feeder) => {
            if(feeder){
                res.render('./animalfeeder/animalfeeder',{
                    theme: req.session.theme,
                    lang: req.session.lang,
                    user: req.user,
                    feeder,
                    clock,
                });
            }else res.send('device not found!!');
        })
    }else{
        res.render('./animalfeeder/login', {
            theme: req.session.theme,
            lang: req.session.lang,
            user: req.user,
            clock,
        });
    }
});
router.get('/add-time', (req, res, next) => {
    var id = req.session.petid;
    Animalfeeder.findOne({id}, (err, feeder) => {
        if(feeder){
            res.render('./animalfeeder/add-time',{
                theme: req.session.theme,
                lang: req.session.lang,
                user: req.user,
                feeder,
                clock,
            });
        }else res.send('device not found!!');
    })
});
router.post('/add-time', (req, res, next) => {
    var {hour, minute, second} = req.body;
    var id = req.session.petid;
    Animalfeeder.findOne({id}, (err, feeder) => {
        if(feeder){
            feeder.times.push({hour, minute, second});
            Animalfeeder.updateMany({id}, {$set: {times: feeder.times}}, (err, doc) => {
                req.flash('success_msg', 'ساعت با موفقیت اضافه شد.');
                res.redirect('/animalfeeder');
            })
        }else res.send('device not found!!');
    });
});
router.post('/login', (req, res, next) => {
    var {id, password} = req.body;
    Animalfeeder.findOne({id}, (err, feeder) => {
        if(feeder){
            if(feeder.password == password){
                req.session.petid = id;
                req.flash('success_msg', 'با موفقیت وارد شدید.');
                res.redirect('/animalfeeder');
            }else{
                req.flash('error_msg', 'کلمه عبور صحیح نمیباشد.');
                res.redirect('/animalfeeder');
            }
        }else{
            req.flash('error_msg', 'دستگاه ثبت نشده.');
            res.redirect('/animalfeeder');
        }
    });
});
router.get('/delete-time', (req, res, next) => {
    var {id, index} = req.query;
    Animalfeeder.findOne({id}, (err, feeder) => {
        feeder.times.splice(index, 1);
        Animalfeeder.updateMany({id}, {$set: {times: feeder.times}}, (err, feeder) => {
            req.flash('success_msg', 'ساعت با موفقیت حذف شد.');
            res.redirect('/animalfeeder');
        })
    })  
});
router.get('/api', (req, res, next) => {
    var { id } = req.query;
    const animalFeederData = {
        time: [
            { hour: 10, minute: 0, second: 0 },
            { hour: 0, minute: 0, second: 5 },
            { hour: 0, minute: 0, second: 5 },
            { hour: 0, minute: 0, second: 5 },
        ],
        id: 10,
    };
    res.json(animalFeederData);

    // res.render('./animalfeeder/animalfeeder',{
    //     theme: req.session.theme,
    //     lang: req.session.lang,
    //     user: req.user
    // });
});

module.exports = router;