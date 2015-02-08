(function(analyticsController) {
  var express = require('express');
  var router = express.Router();
  var analyticsServices = require('./analyticsServices');

  analyticsController.init = function(app) {
    app.get('/', function(req, res) {
      analyticsServices.getTopUserStatistics(app.db, function(err, result) {
        if (err) {
          res.status(500);
          res.send({
            error: err
          });
        } else {
          res.render('index', {
            title: '#charity Analytics',
            tops: result
          });
        }
      });
    });

    app.get('/statistics', function(req, res) {

      analyticsServices.getUserStatistics(app.db, req.query.from, req.query.to, function(err, result) {
        if (err) {
          res.status(500);
          res.send({
            error: err
          });
        } else {
          res.send(result);
        }
      });

    });
  };

}(module.exports));
