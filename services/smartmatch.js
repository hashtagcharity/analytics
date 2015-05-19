var models = global.models,
  async = require('async'),
  _ = require('lodash');

var calculateImpact = function(impactNumber) {
  if (impactNumber < 89) {
    return "Normal";
  } else if (impactNumber < 120) {
    return "High";
  } else {
    return "Superior";
  }
};
var calculateImpactNumber = function(user, project) {
  var impact = 0,
    numberOfMatchingSkills = _.intersection(user.linkedin.skills, project.skills).length;
  if (numberOfMatchingSkills > 4) {
    impact += 377;
  } else if (numberOfMatchingSkills === 3) {
    impact += 233;
  } else if (numberOfMatchingSkills === 2) {
    impact += 144;
  } else if (numberOfMatchingSkills === 1) {
    impact += 89;
  }
  if (user.linkedin.interests && project.keywords.length > 0) {
    var numberOfMatchingKeywords = 0;
    _.forEach(project.keywords, function(keyword) {
      if (_.contains(user.linkedin.interests.toLowerCase(), keyword.toLowerCase())) {
        numberOfMatchingKeywords++;
      }
    });
    if (numberOfMatchingKeywords > 4) {
      impact += 55;
    } else if (numberOfMatchingKeywords === 3) {
      impact += 34;
    } else if (numberOfMatchingKeywords === 2) {
      impact += 21;
    } else if (numberOfMatchingKeywords === 1) {
      impact += 13;
    }
  }
  return impact;
};

var manageCalculation = function(user, project, next) {
  var impactNumber = calculateImpactNumber(user, project);
  var impact = calculateImpact(impactNumber);
  if (impactNumber > 0) {
    models.SmartMatch.update({
        userId: user.shortId,
        projectShortName: project.shortName
      }, {
        $set: {
          impact: impact,
          userId: user.shortId,
          projectShortName: project.shortName,
          impactNumber: impactNumber,
          calculatedAt: new Date()
        }
      }, {
        upsert: true
      },
      next);
  } else {
    models.SmartMatch.remove({
      userId: user.shortId,
      projectShortName: project.shortName
    }, next);
  }
};

module.exports = {
  calculateForUser: function(userId, next) {
    models.Project.find({
      status: "active"
    }, function(ep, projects) {
      models.User.findOne({
        shortId: userId
      }, function(eu, user) {
        if (user) {
          async.each(projects, function(project, next) {
            manageCalculation(user, project, next);
          }, next);
        } else {
          next("User not found");
        }
      });
    });
  },
  calculateForProject: function(projectId, next) {
    models.Project.findOne({
      shortName: projectId,
      status: "active"
    }, function(ep, project) {
      if (project) {
        models.User.find(function(eu, users) {
          async.each(users, function(user, next) {
            manageCalculation(user, project, next);
          }, next);
        });
      } else {
        next("Project not found");
      }
    });
  },
  calculateAll: function(next) {
    models.Project.find({
      status: "active"
    }, function(ep, projects) {
      models.User.find(function(eu, users) {
        async.each(projects, function(project, next) {
          async.each(users, function(user, next) {
            manageCalculation(user, project, next);
          }, next);
        }, next);
      });
    });
  },
  calculateTopProjects: function(numberOfProjects, next) {
    models.Project.find({
        status: 'active',
        "$where": "this.team.maxMembers - this.team.members.length>0"
      }, 'shortName title team',
      function(err, projects) {
        if (err) {
          next(err);
        } else {
          models.User.find({
            "linkedin.email": {
              "$exists": true
            }
          }, function(err, users) {
            if (err) {
              next(err);
            } else {
              async.map(users, function(user, next) {
                models.SmartMatch.find({
                  userId: user.shortId
                }, function(err, matches) {
                  if (err) {
                    next(err);
                  } else {
                    var joined = [];
                    _.forEach(matches, function(m) {
                      var pIndex = _.findIndex(projects, function(p) {
                        return p.shortName === m.projectShortName;
                      });
                      if (pIndex !== -1) {
                        var project = projects[pIndex];
                        var alreadyMember = _.some(project.team.members, function(m) {
                          return m.shortId == user.shortId;
                        });
                        var alreadyOnWaitlist = _.some(project.team.waitlist, function(m) {
                          return m.shortId == user.shortId;
                        });
                        if (!alreadyMember && !alreadyOnWaitlist) {
                          joined.push({
                            user: {
                              id: user.shortId,
                              name: user.name,
                              email: user.linkedin.email,
                              firstName: user.linkedin.firstName
                            },
                            project: {
                              shortName: project.shortName,
                              title: project.title,
                              openPositions: project.team.maxMembers - project.team.members.length,
                              takenPositions: project.team.members.length
                            },
                            sm: {
                              impact: m.impact,
                              impactNumber: m.impactNumber
                            }
                          });
                        }
                      }
                    });
                    var sorted = _.sortBy(joined, function(r) {
                      return r.sm.impactNumber;
                    }).reverse().slice(1, numberOfProjects + 1);
                    next(null, sorted);
                  }
                });
              }, next);
            }
          });
        }
      });
  }
};
