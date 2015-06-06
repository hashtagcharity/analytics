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

function getNumOfProjWithMinThreeTask(numberOfTasks, next) {
  db.collection("projects").count({
    "tasks.todo": {
      $exists: true
    },
    $where: 'this.tasks.todo.length+this.tasks.done.length+this.tasks.doing.length>=' + numberOfTasks
  }, next);
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
      numberOfNgosByStatus: function(callback) {
        getNumberOfNgosByStatus(callback);
      },
      numberOfProjects: function(callback) {
        getNumberOfProjects(callback);
      },
      numberOfProjWithMinOneMember: function(callback) {
        getNumOfProjWithMinOneMember(1, callback);
      },
      numberOfProjWithMinOneFile: function(callback) {
        getNumOfProjWithMinFiles(2, callback);
      },
      numberOfProjWithMinThreeTask: function(callback) {
        getNumOfProjWithMinThreeTask(3, callback);
      }
    }, next);
  },
  calculateTopProjects: function(numberOfProjects, next) {
    db = global.db;
    getTopProjects(numberOfProjects, next);
  }
};
