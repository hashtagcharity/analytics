var _ = require('lodash');
var async = require('async');
var db = undefined;

function getNumberOfUsers(next) {
  db.collection("users").count(next);
}

function getNumberOfNgos(next) {
  db.collection("ngos").count({
    status: 'active'
  }, next);
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

function getNumOfProjWithMinFiveChatMessage(numberOfMessage, next) {
  db.collection('projectchatmessages').aggregate([{
    $group: {
      _id: "$projectShortName",
      count: {
        $sum: 1
      }
    }
  }, {
    $match: {
      count: {
        $gt: numberOfMessage
      }
    }
  }, {
    $group: {
      _id: "$fake",
      count: {
        $sum: 1
      }
    }
  }], function(err, res) {
    console.log('itt');
    if (err) {
      next(err);
    } else {
      if (res && res.length > 0) {
        next(null, res[0].count);
      } else {
        next(null, 0);
      }
    }
  });
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
      numberOfNgos: function(callback) {
        getNumberOfNgos(callback);
      },
      numberOfProjects: function(callback) {
        getNumberOfProjects(callback);
      },
      numberOfProjWithMinOneMember: function(callback) {
        getNumOfProjWithMinOneMember(1, callback);
      },
      numberOfProjWithMinOneFile: function(callback) {
        getNumOfProjWithMinFiles(1, callback);
      },
      numberOfProjWithMinThreeTask: function(callback) {
        getNumOfProjWithMinThreeTask(3, callback);
      },
      numberOfProjWithMinFiveChatMessage: function(callback) {
        getNumOfProjWithMinFiveChatMessage(5, callback);
      }
    }, next);
  }
};
