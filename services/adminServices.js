var models = global.models,
  async = require('async'),
  _ = require('lodash');

module.exports = {
  getOlderProjectsWithoutMembers: function(next) {
    var d = new Date();
    d.setMonth(d.getMonth() - 1);
    models.ProjectApprovalRequest.find({
      "approved.on": {
        "$lt": d
      }
    }, 'shortName', function(err, projects) {
      if (err) {
        next(err);
      } else {
        var shortNames = _.map(projects, function(r) {
          return r.shortName;
        });
        models.Project.find({
          shortName: {
            '$in': shortNames
          },
          status: 'active',
          '$where': 'this.team.members.length==0'
        }, 'title shortName', function(err, result) {
          if (err) {
            next(err);
          } else {
            var mappedResult = _.map(result, function(r) {
              return {
                title: r.title,
                shortName: r.shortName
              };
            });
            next(null, mappedResult);
          }
        });
      }
    });
  },
};
