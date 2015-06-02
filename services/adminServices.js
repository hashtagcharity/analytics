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

function getProjectsByNgos(shortNames, next) {
  models.Project.aggregate([{
    $match: {
      'ngo.shortName': {
        $in: shortNames
      },
      status: {
        $in: ['draft', 'pending']
      }
    }
  }, {
    $group: {
      _id: '$ngo.shortName',
      projects: {
        $addToSet: {
          title: '$title',
          shortName: '$shortName',
          status: '$status'
        }
      }
    }
  }], next);
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
            var adminsIds = _.map(ngos, function(n) {
              return n.admin.shortId;
            });
            models.User.find({
              shortId: {
                $in: adminsIds
              }
            }, function(err, users) {

              if (err) {
                next(err);
              } else {
                getProjectsByNgos(_.map(ngos, 'shortName'), function(err, projects) {
                  if (err) {
                    next(err);
                  } else {
                    var result = _.map(ngos, function(temp) {
                      var row = {
                        name: temp.name,
                        shortName: temp.shortName,
                        status: temp.status,
                      };
                      var userIndex = _.findIndex(users, function(u) {
                        return u.shortId === temp.admin.shortId;
                      });
                      if (userIndex !== -1) {
                        row.adminName = users[userIndex].name;
                        row.adminEmail = users[userIndex].linkedin.email;
                      }
                      var projectsIndex = _.findIndex(projects, function(p) {
                        return p._id == temp.shortName;
                      });
                      if (projectsIndex !== -1) {
                        var projs = _.map(projects[projectsIndex].projects, function(p) {
                          return '(t: ' + p.title + '; n: ' + p.shortName + '; s: ' + p.status + ')';
                        });
                        row.projects = projs.join('|');
                      }
                      return row;
                    });

                    next(null, result);
                  }
                });
              }
            });
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
