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
        shortIds.push(p.owner.shortId);
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
        $where: 'this.tasks.todo.length+this.tasks.done.length+this.tasks.doing.length==0'
      }]
    }, function(err, projects) {
      if (err) {
        next(err);
      } else {
        prepareResultFromProject(projects, next);
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
  }
};
