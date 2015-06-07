var _ = require('lodash');
var async = require('async');
var db = undefined;
var models = global.models;

function getNumberOfUsers(next) {
  db.collection("users").count(next);
}

function getNgosWithProjects(next) {
  models.Project.distinct('ngo.shortName', {
    status: {
      $in: ['active', 'closed']
    }
  }, next);
}

function getNumberOfNgosByStatus(next) {
  models.Ngo.aggregate([{
    $group: {
      _id: '$status',
      count: {
        $sum: 1
      }
    }
  }], function(err, ngoStats) {
    if (err) {
      next(err);
    } else {
      getNgosWithProjects(function(err, ngosWithProjects) {
        if (err) {
          next(err);
        } else {
          var result = {};
          for (var i = ngoStats.length - 1; i >= 0; i--) {
            result[ngoStats[i]._id] = ngoStats[i].count;
          }
          var allNgos = result.pending + result.draft + result.active;
          result.pendingPerc = parseInt(result.pending * 100 / allNgos);
          result.draftPerc = parseInt(result.draft * 100 / allNgos);
          result.activePerc = parseInt(result.active * 100 / allNgos);
          result.withProjects = ngosWithProjects.length;
          result.withProjectsPerc = parseInt(result.withProjects * 100 / result.active);
          result.withoutProjects = result.active - ngosWithProjects.length;

          next(null, result);
        }
      });
    }
  });
}

function getNumberOfProjectsByStatus(next) {
  models.Project.aggregate([{
    $group: {
      _id: '$status',
      count: {
        $sum: 1
      }
    }
  }], function(err, projectStats) {
    if (err) {
      next(err);
    } else {
      var result = {};
      for (var i = projectStats.length - 1; i >= 0; i--) {
        result[projectStats[i]._id] = projectStats[i].count;
      }
      result.closed = result.closed ? result.closed : 0;
      var allProjects = result.pending + result.draft + result.active + result.closed;
      result.pendingPerc = parseInt(result.pending * 100 / allProjects);
      result.draftPerc = parseInt(result.draft * 100 / allProjects);
      result.activePerc = parseInt(result.active * 100 / allProjects);
      result.closedPerc = parseInt(result.closed * 100 / allProjects);
      next(null, result);
    }
  });
}

function getNumberOfProjects(next) {
  db.collection("projects").count({
    status: 'active'
  }, next);
}

function getNumOfProjWithMinOneMember(numberOfMembers, next) {
  db.collection("projects").count({
    "team.members": {
      $exists: true
    },
    $where: 'this.team.members.length>=' + numberOfMembers
  }, next);
}

function getNumOfProjWithMinFiles(numberOfFiles, next) {
  db.collection("projects").count({
    "fileStore.files": {
      $exists: true
    },
    $where: 'this.fileStore.files.length>=' + numberOfFiles
  }, next);
}

function getNumOfWellManagedProjects(next) {
  models.Project.count({
    "tasks.todo": {
      $exists: true
    },
    $where: 'this.tasks.todo.length+this.tasks.done.length+this.tasks.doing.length>=3 && this.fileStore.files.length>=1',
  }, next);
}

function getNumOfUsersWithoutSkills(next) {
  models.User.count({
    $where: 'this.linkedin.skills.length==0'
  }, next);
}

function getNumberOfUsersWithoutInterests(next) {
  models.User.count({
    'linkedin.interests': {
      $exists: false
    }
  }, next);
}

function getNumberOfUsersWithoutSlack(next) {
  models.User.count({
    'slackName': {
      $exists: false
    }
  }, next);
}

function getNumberOfProjectOwners(next) {
  models.Project.distinct('owner.shortId', function(err, result) {
    if (err) {
      next(err);
    } else {
      next(null, result.length);
    }
  });
}

function getNumberOfOpenPositions(next) {
  models.Project.aggregate([{
    $match: {
      status: 'active'
    }
  }, {
    $project: {
      openPositions: {
        $subtract: ["$team.maxMembers", {
          $size: "$team.members"
        }]
      }
    }
  }, {
    $group: {
      _id: null,
      sum: {
        $sum: "$openPositions"
      }
    }
  }], function(err, result) {
    if (err) {
      next(err);
    } else {
      if (result && result.length > 0) {
        next(null, result[0].sum);
      } else {
        next(null, 0);
      }
    }
  });
}

function getNumberOfTakenPositions(next) {
  models.Project.aggregate([{
    $match: {
      status: 'active'
    }
  }, {
    $project: {
      takenPositions: {
        $size: "$team.members"
      }
    }
  }, {
    $group: {
      _id: null,
      sum: {
        $sum: "$takenPositions"
      }
    }
  }], function(err, result) {
    if (err) {
      next(err);
    } else {
      if (result && result.length > 0) {
        next(null, result[0].sum);
      } else {
        next(null, 0);
      }
    }
  });
}

function getNumberOfPendingPositions(next) {
  models.Project.aggregate([{
    $match: {
      status: 'active'
    }
  }, {
    $project: {
      takenPositions: {
        $size: "$team.waitlist"
      }
    }
  }, {
    $group: {
      _id: null,
      sum: {
        $sum: "$takenPositions"
      }
    }
  }], function(err, result) {
    if (err) {
      next(err);
    } else {
      if (result && result.length > 0) {
        next(null, result[0].sum);
      } else {
        next(null, 0);
      }
    }
  });
}

function getNumberOfLikes(next) {
  models.Project.aggregate([{
    $group: {
      _id: null,
      likes: {
        $sum: '$numberOfCares'
      }
    }
  }], function(err, result) {
    if (err) {
      next(err);
    } else {
      if (result && result.length > 0) {
        next(null, result[0].likes);
      } else {
        next(null, 0);
      }
    }
  });
}

function getNumberOfCountries(next) {
  models.User.distinct('linkedin.countryCode', function(err, result) {
    if (err) {
      next(err);
    } else {
      next(null, result.length);
    }
  });
}

function getProjectsByStatusAndType(next) {
  models.Project.aggregate([{
    $group: {
      _id: {
        status: '$status',
        type: '$type'
      },
      count: {
        $sum: 1
      }
    }
  }], next);
}

module.exports = {
  getStatistics: function(next) {
    db = global.db;
    async.parallel({
      date: function(callback) {
        callback(null, (new Date()).toLocaleDateString());
      },
      numberOfUsers: function(callback) {
        getNumberOfUsers(callback);
      },
      ngoStats: function(callback) {
        getNumberOfNgosByStatus(callback);
      },
      projectStats: function(callback) {
        getNumberOfProjectsByStatus(callback);
      },
      volStats: function(callback) {
        async.parallel({
          takenPositions: function(cb) {
            getNumberOfTakenPositions(cb);
          },
          openPositions: function(cb) {
            getNumberOfOpenPositions(cb);
          },
          pendingPositions: function(cb) {
            getNumberOfPendingPositions(cb);
          }
        }, callback);
      },
      userStats: function(callback) {
        async.parallel({
          withoutSkills: function(cb) {
            getNumOfUsersWithoutSkills(cb);
          },
          withoutInterest: function(cb) {
            getNumberOfUsersWithoutInterests(cb);
          },
          withoutSlack: function(cb) {
            getNumberOfUsersWithoutSlack(cb);
          },
          projectOwners: function(cb) {
            getNumberOfProjectOwners(cb);
          }
        }, callback);
      },
      numberOfLikes: function(callback) {
        getNumberOfLikes(callback);
      },
      numberOfCountries: function(callback) {
        getNumberOfCountries(callback);
      },
      numberOfProjects: function(callback) {
        getNumberOfProjects(callback);
      },
      numberOfWellManagedProjects: function(callback) {
        getNumOfWellManagedProjects(callback);
      }
    }, next);
  },
  calculateTopProjects: function(numberOfProjects, next) {
    db = global.db;
    getTopProjects(numberOfProjects, next);
  }
};
