var express = require('express');
var _ = require('lodash');
var config = require("../config");
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: '#charity Analytics'
    });
});

Date.prototype.clearTime = function () {
    this.setHours(0); this.setMinutes(0); this.setSeconds(0); this.setMilliseconds(0);
};
Date.prototype.isValidDate = function isValidDate() {
    if (Object.prototype.toString.call(this) !== "[object Date]")
        return false;
    return !isNaN(this.getTime());
}

router.get('/statistics', function (req, res) {
    MongoClient.connect(config.mongoPath, function (err, db) {
        if (err) throw err;
        
        console.log("Connected to mongodb on " + config.mongoPath)
        var subs = db.collection('subscriptions');
        subs.aggregate([{
                $group:
 {
                    _id: "$emailAddress",
                    subscribedAt: { $first: "$subscribedAt" }
                }
            },{
                $project: {
                    year: { $year: "$subscribedAt" },
                    month: { $month: "$subscribedAt" },
                    day: { $dayOfMonth: "$subscribedAt" },
                    originalDate: "$subscribedAt"
                }
            }, {
                $group: {
                    _id: {
                        year: "$year",
                        month: "$month",
                        day: "$day"
                    },
                    date : { $first : '$originalDate' },
                    count: { $sum: 1 },
                },
                
            },
            {
                $project: {
                    _id: 0,
                    date: 1,
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }], function (err, subResult) {
            var firstDate = _.first(subResult).date; firstDate.clearTime();
            var lastDate = _.last(subResult).date; lastDate.clearTime();
            
            var timeDiff = Math.abs(lastDate.getTime() - firstDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            var dates = _.map(_.range(diffDays), function (diff) {
                var newDate = new Date(firstDate);
                newDate.setDate(firstDate.getDate() + diff);
                return newDate;
            });
            
            var dbResult = _.map(subResult, function (r) {
                var tempDate = r.date;
                tempDate.clearTime();
                return {
                    x: tempDate,
                    y: [r.count]
                };
            });
            
            _.each(dates, function (date) {
                var r = _.filter(dbResult, function (dbRes) {
                    return dbRes.x.getTime() == date.getTime()
                });
                if (r.length == 0) {
                    dbResult.push({
                        x: date,
                        y: [0]
                    });
                }
            });
            
            var result = _.sortBy(dbResult, function (r) {
                return r.x;
            });
            
            _.each(result, function (r) {
                var earlier = _.filter(result, function (innerResult) {
                    return innerResult.x.getTime() <= r.x.getTime();
                });
                var sum = _.reduce(earlier, function (memo, value) {
                    return memo + value.y[0];
                }, 0);
                
                r.y.push(sum);
            });
            
            var from = new Date(Date.parse(req.query.from));
            if (from.isValidDate()) {
                result = _.filter(result, function (r) {
                    return r.x.getTime() >= from.getTime();
                });
            }
            var to = new Date(Date.parse(req.query.to));
            if (to.isValidDate()) {
                result = _.filter(result, function (r) {
                    return r.x.getTime() <= to.getTime();
                });
            }
            _.each(result, function (r) {
                var date = r.x
                r.x = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate()
            })
            
            res.send(result);
            db.close();
        });
    })
});

module.exports = router;
