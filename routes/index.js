var express = require('express');
var _ = require('lodash');
var config = require("../config");
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: '#charity Analytics'
  });
});

router.get('/statistics', function(req, res) {
  MongoClient.connect(config.mongoPath, function(err, db) {
    if (err) throw err;

    console.log("Connected to mongodb on " + config.mongoPath)
    var subs = db.collection('subscriptions');

    subs.aggregate([{
      $project: {
        year: {
          $year: "$subscribedAt"
        },
        month: {
          $month: "$subscribedAt"
        },
        day: {
          $dayOfMonth: "$subscribedAt"
        }
      }
    }, {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          day: "$day"
        },
        count: {
          $sum: 1
        }
      }
    }], function(err, subResult) {
      subResult.reverse();
      var first = _.first(subResult);
      var last = _.last(subResult);
      var firstDate = new Date(first._id.year, first._id.month - 1, first._id.day);
      var lastDate = new Date(last._id.year, last._id.month - 1, last._id.day);

      var timeDiff = Math.abs(lastDate.getTime() - firstDate.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      var dates = _.map(_.range(diffDays), function(diff) {
        var newDate = new Date(firstDate);
        newDate.setDate(firstDate.getDate() + diff);
        return newDate;
      });

      var dbResult = _.map(subResult, function(r) {
        return {
          x: new Date(r._id.year, r._id.month - 1, r._id.day),
          y: [r.count]
        };
      });

      _.each(dates, function(date) {
        var r = _.filter(dbResult, function(dbRes) {
          return dbRes.x.getTime() == date.getTime()
        });
        if (r.length == 0) {
          dbResult.push({
            x: date,
            y: [0]
          });
        }
      });

      var result = _.sortBy(dbResult, function(r) {
        return r.x;
      });

      _.each(result, function(r) {
        var earlier = _.filter(result, function(innerResult) {
          return innerResult.x.getTime() <= r.x.getTime();
        });
        var sum = _.reduce(earlier, function(memo, value) {
          return memo + value.y[0];
        }, 0);

        r.y.push(sum);
      });

      _.each(result, function(r) {
        var date = r.x
        r.x = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
      })

      res.send(result);
      db.close();
    });
  })
});

module.exports = router;
