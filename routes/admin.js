(function(analyticsController) {
  var express = require('express');
  var sm = require('../services/smartmatch');
  var csv = require('express-csv');
  var Parse = require('csv-parse');
  var multer = require('multer');
  var fs = require('fs');
  var _ = require('lodash');
  var mandrill = require('../services/mandrill');
  var models = global.models;
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
            ['userId', 'userName', 'userEmail', 'userFirstName',
              'shortName', 'title', 'open', 'taken', 'impact', 'impactNumber'
            ]
          ];
          _.each(result, function(a) {
            if (a.length > 0) {
              var r = a[0];
              transformed.push({
                userId: r.user.id,
                userName: r.user.name,
                userEmail: r.user.email,
                userFirstName: r.user.firstName,
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

    function processFile(req, next) {
      var source = fs.createReadStream(req.files.matches.path);
      var lines = [];

      var parser = Parse({
        delimiter: ',',
        columns: true
      });

      parser.on("readable", function() {
        var record;
        while (record = parser.read()) {
          lines.push(record);
        }
      });
      parser.on("error", function(err) {
        next(err);
      });
      parser.on("end", function() {
        next(null, lines);
      });
      source.pipe(parser);
    }

    function createPayload(records, next) {
      var shortNames = _.map(records, function(r) {
        return r.shortName;
      });
      global.models.Project.find({
        'shortName': {
          "$in": shortNames
        }
      }, function(err, projects) {
        if (err) {
          next(err);
        } else {
          var extendedRecords = [];
          _.each(records, function(r) {
            var project = _.find(projects, function(p) {
              return p.shortName == r.shortName;
            });
            if (project) {
              var extended = {
                to: r.userEmail,
                model: {
                  firstName: r.userFirstName,
                  projectTitle: project.title,
                  shortDescription: project.shortDescription,
                  projectShortName: project.shortName,
                  projectPicUrl: project.cardHeader,
                  projectOwner: project.owner.firstName + ' ' + project.owner.lastName,
                  projectOwnerId: project.owner.shortId
                }
              };
              extendedRecords.push(extended);
            }
          });
          next(null, extendedRecords);
        }
      });
    }

    app.post('/admin/topsmartmatches', [multer({
      dest: './uploads/'
    }), function(req, res) {
      if (req.files.matches) {
        processFile(req, function(err, records) {
          if (err) {
            res.status(500).end();
          } else {
            createPayload(records, function(err, payload) {
              mandrill.sendTemplatedMail('matchforimpact', payload, function(err, result) {
                res.render('admin', {
                  title: '#charity Admin',
                  message: 'SmartMatch email sending successful'
                });

              });
            });
          }
        });
      } else {
        res.status(500).end();
      }
    }]);

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

    app.post('/admin/')
  };

}(module.exports));
