var models = global.models,
  async = require('async'),
  _ = require('lodash');

function getNgosWithProjects(next) {
  models.Project.distinct('ngo.shortName', {
    status: {
      $in: ['active', 'closed']
    }
  }, next);
}

module.exports = {

  getNgosWithoutProjects: function(next) {
    getNgosWithProjects(function(err, ngoShortNames) {
      if (err) {
        next(err);
      } else {
        models.Ngo.find({
          shortName: {
            $not: {
              $in: ngoShortNames
            }
          }
        }, function(err, ngos) {
          if (err) {
            next(err);
          } else {
            var result = _.map(ngos, function(temp) {
              return {
                name: temp.name,
                shortName: temp.shortName
              };
            });
            next(null, result);
          }
        });
      }
    });
  },
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
        }, 'title shortName owner', function(err, result) {
          if (err) {
            next(err);
          } else {
            var ownerIds = _.map(result, function(r) {
              return r.owner.shortId;
            });
            models.User.find({
              'shortId': {
                '$in': ownerIds
              }
            }, 'shortId linkedin.firstName linkedin.lastName linkedin.email', function(err, owners) {
              var mappedResult = _.map(result, function(r) {
                var row = {
                  title: r.title,
                  shortName: r.shortName
                };
                var ownerIndex = _.findIndex(owners, function(o) {
                  return o.shortId === r.owner.shortId;
                });
                if (ownerIndex !== -1) {
                  var owner = owners[ownerIndex];
                  row.ownerName = owner.name;
                  row.ownerEmail = owner.linkedin.email;
                }
                return row;
              });
              next(null, mappedResult);
            });
          }
        });
      }
    });
  },
};
