(function(analyticsController) {
  var express = require('express');
  var sm = require('../services/smartmatch');
  var csv = require('express-csv');
  var _ = require('lodash');
  analyticsController.init = function(app) {
    app.get('/admin', function(req, res) {
      res.render('admin', {
        title: '#charity Admin'
      });
    });

    app.get('/admin/topsmartmatches', function(req, res) {
      sm.calculateTopProjects(1, function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          var transformed = [
            ['UserId', 'UserName', 'ShortName', 'Title', 'Open', 'Taken', 'Impact', 'ImpactNumber']
          ];
          _.each(result, function(a) {
            if (a.length > 0) {
              var r = a[0];
              transformed.push({
                userId: r.user.id,
                userName: r.user.name,
                projectShortName: r.project.shortName,
                projectTitle: r.project.title,
                openPositions: r.project.openPositions,
                takenPositions: r.project.takenPositions,
                impact: r.sm.impact,
                impactNumber: r.sm.impactNumber
              });
            }
          });
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=topsmartmatches.csv');
          res.csv(transformed);
        }
      });
    });

    app.get('/admin/calculatesm', function(req, res) {
      sm.calculateAll(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          res.send({
            succes: true
          });
        }
      });
    });
  };

}(module.exports));
