(function(analyticsController) {
  var express = require('express');
  var router = express.Router();
  var analyticsServices = require('./analyticsServices');
  var twopointo = require('./twopointo');

  analyticsController.init = function(app) {
    app.get('/', function(req, res) {
      analyticsServices.getTopUserStatistics(function(err, result) {
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

      analyticsServices.getUserStatistics(req.query.from, req.query.to, function(err, result) {
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

    app.get('/statistics2', function(req, res) {

      twopointo.getStatistics(function(err, result) {
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

    app.get('/topmatches', function(req, res) {

      twopointo.calculateTopProjects(1, function(err, result) {
        if (err) {
          res.status(500);
          res.send({
            error: err
          });
        } else {

          console.log(result);
          res.send(result);
        }
      });

    });

    app.get('/countryCodes', function(req, res) {

      analyticsServices.getCountryCodes(function(err, result) {
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
