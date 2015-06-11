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
  };


}(module.exports));
