(function(exportController) {
  var exportServices = require('../services/exportServices');

  exportController.init = function(app) {
    app.get('/export/withoutskills', function(req, res) {
      exportServices.exportUserWithoutSkills(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['firstName', 'email']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutskills.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withoutinterests', function(req, res) {
      exportServices.exportUserWithoutInterests(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['firstName', 'email']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutintrests.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withoutslack', function(req, res) {
      exportServices.exportUserWithoutSlack(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['firstName', 'email']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutslack.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withouttodo', function(req, res) {
      exportServices.exportProjectWithoutTodo(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withouttodo.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withoutfiles', function(req, res) {
      exportServices.exportProjectWithoutFiles(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutfiles.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withoutrepo', function(req, res) {
      exportServices.exportProjectWithoutRepo(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutrepo.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/withoutdeadline', function(req, res) {
      exportServices.exportProjectWithoutDeadline(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutdeadline.csv');
          res.csv(result);
        }
      });
    });


    app.get('/export/withoutlinks', function(req, res) {
      exportServices.exportProjectWithoutLinks(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutlinks.csv');
          res.csv(result);
        }
      });
    });


    app.get('/export/withoutmilestones', function(req, res) {
      exportServices.exportProjectWithoutMilestones(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=withoutmilestones.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/draftprojects', function(req, res) {
      exportServices.exportDraftProjects(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=draftprojects.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/pendingprojects', function(req, res) {
      exportServices.exportPendingProjects(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=pendingprojects.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/draftngos', function(req, res) {
      exportServices.exportDraftNgos(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=draftngos.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/pendingngos', function(req, res) {
      exportServices.exportPendingNgos(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=pendingngos.csv');
          res.csv(result);
        }
      });
    });

    app.get('/export/pendingpositions', function(req, res) {
      exportServices.exportPendingPositions(function(err, result) {
        if (err) {
          res.status(500).send({
            error: err
          });
        } else {
          result.unshift(['name', 'link', 'member', 'email', 'isOwner']);
          res.set('Content-Type', 'text/csv');
          res.setHeader('Content-disposition', 'attachment; filename=pendingpositions.csv');
          res.csv(result);
        }
      });
    });

  };


}(module.exports));
