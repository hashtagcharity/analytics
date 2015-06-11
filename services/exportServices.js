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
  }
};
