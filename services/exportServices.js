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

function mapUser(user) {
  return {
    firstName: user.linkedin.firstName,
    email: user.linkedin.email
  };
}

function transformUsersToDict(users) {
  var result = {};
  _.forEach(users, function(u) {
    result[u.shortId] = u;
  });
  return result;
}

function prepareResultFromProject(projects, next) {
  var shortIds = [];
  _.forEach(projects, function(p) {
    shortIds.push(p.owner.shortId);
    _.forEach(p.team.members, function(m) {
      shortIds.push(m.shortId);
    });
  });
  models.User.find({
    shortId: {
      $in: shortIds
    }
  }, function(err, users) {
    if (err) {
      next(err);
    } else {
      var userDict = transformUsersToDict(users);
      var result = [];
      _.forEach(projects, function(p) {
        var user = userDict[p.owner.shortId];
        if (user) {
          result.push({
            name: p.title,
            link: 'http://hashtagcharity.org/projects/' + p.shortName,
            user: user.linkedin.firstName,
            email: user.linkedin.email,
            isOwner: true
          });
        }
        _.forEach(p.team.members, function(m) {
          var member = userDict[m.shortId];
          if (member) {
            result.push({
              name: p.title,
              link: 'http://hashtagcharity.org/projects/' + p.shortName,
              user: member.linkedin.firstName,
              email: member.linkedin.email,
              isOwner: false
            });
          }
        });
      });
      next(null, result);
    }
  });
}

function prepareResultFromNgo(ngos, next) {
  var shortIds = [];
  _.forEach(ngos, function(p) {
    shortIds.push(p.admin.shortId);
  });
  models.User.find({
    shortId: {
      $in: shortIds
    }
  }, function(err, users) {
    if (err) {
      next(err);
    } else {
      var userDict = transformUsersToDict(users);
      var result = [];
      _.forEach(ngos, function(p) {
        var user = userDict[p.admin.shortId];
        if (user) {
          result.push({
            name: p.name,
            link: 'http://hashtagcharity.org/ngos/' + p.shortName,
            user: user.linkedin.firstName,
            email: user.linkedin.email
          });
        }
      });
      next(null, result);
    }
  });
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
  exportUserWithoutSkills: function(next) {
    models.User.find({
      $where: 'this.linkedin.skills.length==0'
    }, function(err, users) {
      if (err) {
        next(err);
      } else {
        next(null, _.map(users, mapUser));
      }
    });
  },
  exportUserWithoutInterests: function(next) {
    models.User.find({
      $or: [{
        'linkedin.interests': {
          $exists: false
        }
      }, {
        'linkedin.interests': ''
      }]
    }, function(err, users) {
      if (err) {
        next(err);
      } else {
        next(null, _.map(users, mapUser));
      }
    });
  },
  exportUserWithoutSlack: function(next) {
    models.User.find({
      $or: [{
        'slackName': {
          $exists: false
        }
      }, {
        'slackName': ''
      }]
    }, function(err, users) {
      if (err) {
        next(err);
      } else {
        next(null, _.map(users, mapUser));
      }
    });
  },

  exportProjectWithoutTodo: function(next) {
    models.Project.find({
      status: 'active',
      $or: [{
        'tasks.todo': {
          $exists: false
        }
      }, {
        'tasks.doing': {
          $exists: false
        }
      }, {
        'tasks.done': {
          $exists: false
        }
      }, {
        $where: 'this.tasks.todo.length+this.tasks.done.length+this.tasks.doing.length<=3'
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },

  exportProjectWithoutFiles: function(next) {
    models.Project.find({
      status: 'active',
      $or: [{
        'fileStore.files': {
          $exists: false
        }
      }, {
        $where: 'this.fileStore.files.length==0'
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },

  exportProjectWithoutRepo: function(next) {
    models.Project.find({
      status: 'active',
      'repoUrl': {
        $exists: false
      }
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportAllProjects: function(next) {
    models.Project.find({}, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, function(err, result) {
          if (err) {
            next(err);
          } else {
            next(null, _.filter(result, function(p) {
              return p.isOwner;
            }));
          }
        });
      }
    });
  },
  exportProjectWithoutCause: function(next) {
    models.Project.find({
      status: 'active',
      $or: [{
        'cause': {
          $exists: false
        }
      }, {
        'cause': ''
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, function(err, result) {
          if (err) {
            next(err);
          } else {
            next(null, _.filter(result, function(p) {
              return p.isOwner;
            }));
          }
        });
      }
    });
  },
  exportProjectWithoutSavedMoney: function(next) {
    models.Project.find({
        status: 'active',
        'impact.savedMoney': {
          $exists: false
        }
      },
      function(err, projects) {
        if (err) {
          next(err);
        } else {
          prepareResultFromProject(projects, function(err, result) {
            if (err) {
              next(err);
            } else {
              next(null, _.filter(result, function(p) {
                return p.isOwner;
              }));
            }
          });
        }
      });
  },
  exportProjectWithoutPeopleHelped: function(next) {
    models.Project.find({
        status: 'active',
        'impact.peopleHelped': {
          $exists: false
        }
      },
      function(err, projects) {
        if (err) {
          next(err);
        } else {
          prepareResultFromProject(projects, function(err, result) {
            if (err) {
              next(err);
            } else {
              next(null, _.filter(result, function(p) {
                return p.isOwner;
              }));
            }
          });
        }
      });
  },
  exportProjectWithoutDeadline: function(next) {
    models.Project.find({
      status: 'active',
      'dueDate': {
        $exists: false
      }
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportProjectWithoutLinks: function(next) {
    models.Project.find({
      status: 'active',
      $or: [{
        links: {
          $exists: false
        }
      }, {
        $where: 'this.links.length==0'
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportProjectWithoutMilestones: function(next) {
    models.Project.find({
      status: 'active',
      $or: [{
        mileStones: {
          $exists: false
        }
      }, {
        $where: 'this.mileStones.length==0'
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportDraftProjects: function(next) {
    models.Project.find({
      status: 'draft',
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportPendingProjects: function(next) {
    models.Project.find({
      status: 'pending',
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },

  exportWellManagedProjects: function(next) {
    models.Project.find({
      "tasks.todo": {
        $exists: true
      },
      "fileStore.files": {
        $exists: true
      },
      "mileStones": {
        $exists: true
      },
      $where: 'this.tasks.todo.length+this.tasks.done.length+this.tasks.doing.length>=3 && this.fileStore.files.length>=1 && this.mileStones.length>=2',
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
      }
    });
  },
  exportDraftNgos: function(next) {
    models.Ngo.find({
      status: 'draft',
    }, function(err, ngos) {
      if (err) {
        next(err);
      } else {
        prepareResultFromNgo(ngos, next);
      }
    });
  },
  exportPendingNgos: function(next) {
    models.Ngo.find({
      status: 'pending',
    }, function(err, ngos) {
      if (err) {
        next(err);
      } else {
        prepareResultFromNgo(ngos, next);
      }
    });
  },

  exportAllNgos: function(next) {
    models.Ngo.find({}, function(err, ngos) {
      if (err) {
        next(err);
      } else {
        prepareResultFromNgo(ngos, next);
      }
    });
  },

  exportPendingPositions: function(next) {
    models.Project.find({
      status: 'active',
      $where: 'this.team.waitlist.length>0'
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, function(err, result) {
          if (err) {
            next(err);
          } else {
            next(null, _.filter(result, function(p) {
              return p.isOwner;
            }));
          }
        });
      }
    });
  },
  exportImpacts: function(next) {
    models.Project.find({
        status: 'active',
        'impact.directImpact': {
          $exists: true
        }
      }, {
        title: 1,
        impact: 1
      },
      function(err, projects) {
        if (err) {
          next(err);
        } else {
          var result = _.map(projects, function(m) {
            return {
              title: m.title,
              shortName: m.shortName,
              impact: m.impact.directImpact
            };
          });
          next(null, result);
        }
      });
  }
};
