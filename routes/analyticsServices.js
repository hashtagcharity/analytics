var _ = require('lodash');
var async = require('async');
var countries = require('./countries');
var db = undefined;
Date.prototype.clearTime = function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
};

Date.prototype.isValidDate = function isValidDate() {
  if (Object.prototype.toString.call(this) !== "[object Date]")
    return false;
  return !isNaN(this.getTime());
};

var getTopSkills = function(next) {
  db.collection("users").aggregate([{
    $unwind: "$linkedin.skills"
  }, {
    $match: {
      "linkedin.skills": {
        $exists: true
      }
    }
  }, {
    $group: {
      _id: "$linkedin.skills",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], next);
};

var getTopProjectSkills = function(next) {
  db.collection("projects").aggregate([{
    $unwind: "$skills"
  }, {
    $match: {
      "skills": {
        $exists: true
      }
    }
  }, {
    $group: {
      _id: "$skills",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], next);
};
var getTopIndustries = function(next) {
  db.collection("users").aggregate([{
    $match: {
      "linkedin.industryGroup": {
        $exists: true
      }
    }
  }, {
    $group: {
      _id: "$linkedin.industryGroup",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], next);
};
var getTopCompanies = function(next) {
  db.collection("users").aggregate([{
    $unwind: "$linkedin.positions"
  }, {
    $group: {
      _id: "$shortId",
      company: {
        $first: "$linkedin.positions"
      }
    }
  }, {
    $match: {
      "company.companyName": {
        $exists: true,
        $nin: [/.*fiedler|hashtagcharity|freelance.*/i, '']
      }
    }
  }, {
    $group: {
      _id: "$company.companyName",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], next);
};
var getTopCountries = function(next) {
  db.collection("users").aggregate([{
    $match: {
      "linkedin.countryCode": {
        $exists: true
      }
    }
  }, {
    $group: {
      _id: "$linkedin.countryCode",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], function(err, result) {
    if (err) {
      next(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        var country = _.find(countries, function(c) {
          return c["alpha-2"].toLowerCase() == result[i].name;
        });

        if (country) {
          result[i].name = country.name;
        } else {
          console.log(result[i].name);
        }
      }
      next(null, result);
    }
  });
};
var getTopEducations = function(next) {
  db.collection("users").aggregate([{
    $unwind: "$linkedin.educations"
  }, {
    $match: {
      "linkedin.educations.schoolName": {
        $exists: true
      }
    }
  }, {
    $group: {
      _id: "$linkedin.educations.schoolName",
      count: {
        $sum: 1
      }
    }
  }, {
    $sort: {
      count: -1
    }
  }, {
    $limit: 10
  }, {
    $project: {
      name: "$_id",
      count: "$count"
    }
  }], next);
};

function getUserStats(next) {
  db.collection('users').aggregate([{
    $project: {
      year: {
        $year: "$registrationDate"
      },
      month: {
        $month: "$registrationDate"
      },
      day: {
        $dayOfMonth: "$registrationDate"
      },
      originalDate: "$registrationDate"
    }
  }, {
    $group: {
      _id: {
        year: "$year",
        month: "$month",
        day: "$day"
      },
      date: {
        $first: '$originalDate'
      },
      count: {
        $sum: 1
      },
    },

  }, {
    $project: {
      _id: 0,
      date: 1,
      count: 1
    }
  }, {
    $sort: {
      date: 1
    }
  }], next);
}

function getProjectStats(next) {
  db.collection('projects').aggregate([{
    $match: {
      status: 'active'
    }
  }, {
    $project: {
      year: {
        $year: "$createdOn"
      },
      month: {
        $month: "$createdOn"
      },
      day: {
        $dayOfMonth: "$createdOn"
      },
      originalDate: "$createdOn"
    }
  }, {
    $group: {
      _id: {
        year: "$year",
        month: "$month",
        day: "$day"
      },
      date: {
        $first: '$originalDate'
      },
      count: {
        $sum: 1
      },
    },

  }, {
    $project: {
      _id: 0,
      date: 1,
      count: 1
    }
  }, {
    $sort: {
      date: 1
    }
  }], next);
}

function getNgoStats(next) {
  db.collection('ngos').aggregate([{
    $match: {
      status: 'active'
    }
  }, {
    $project: {
      year: {
        $year: "$createdOn"
      },
      month: {
        $month: "$createdOn"
      },
      day: {
        $dayOfMonth: "$createdOn"
      },
      originalDate: "$createdOn"
    }
  }, {
    $group: {
      _id: {
        year: "$year",
        month: "$month",
        day: "$day"
      },
      date: {
        $first: '$originalDate'
      },
      count: {
        $sum: 1
      },
    },

  }, {
    $project: {
      _id: 0,
      date: 1,
      count: 1
    }
  }, {
    $sort: {
      date: 1
    }
  }], next);
}

function transformSeries(rFrom, rTo, series) {
  if (series.length > 0) {
    var firstDate = _.first(series).date;
    firstDate.clearTime();
    var lastDate = _.last(series).date;
    lastDate.clearTime();

    var timeDiff = Math.abs(lastDate.getTime() - firstDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    var dates = _.map(_.range(diffDays), function(diff) {
      var newDate = new Date(firstDate);
      newDate.setDate(firstDate.getDate() + diff);
      return newDate;
    });

    var dbResult = _.map(series, function(r) {
      var tempDate = r.date;
      tempDate.clearTime();
      return {
        x: tempDate,
        y: [r.count]
      };
    });

    _.each(dates, function(date) {
      var r = _.filter(dbResult, function(dbRes) {
        return dbRes.x.getTime() == date.getTime();
      });
      if (r.length === 0) {
        dbResult.push({
          x: date,
          y: [0]
        });
      }
    });

    var result = _.sortBy(dbResult, function(r) {
      return r.x;
    });

    _.each(result, function(r) {
      var earlier = _.filter(result, function(innerResult) {
        return innerResult.x.getTime() <= r.x.getTime();
      });
      var sum = _.reduce(earlier, function(memo, value) {
        return memo + value.y[0];
      }, 0);

      r.y.push(sum);
    });

    var from = new Date(Date.parse(rFrom));
    if (from.isValidDate()) {
      result = _.filter(result, function(r) {
        return r.x.getTime() >= from.getTime();
      });
    }
    var to = new Date(Date.parse(rTo));
    if (to.isValidDate()) {
      result = _.filter(result, function(r) {
        return r.x.getTime() <= to.getTime();
      });
    }
    _.each(result, function(r) {
      var date = r.x;
      r.x = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    });
    return result;
  } else {
    return [];
  }
}
var self = module.exports = {
  getUserStatistics: function(rFrom, rTo, next) {
    db = global.db;
    async.parallel({
      users: function(callback) {
        getUserStats(function(err, result) {
          if (err) {
            callback(err);
          } else {
            var transformedResult = transformSeries(rFrom, rTo, result);
            callback(null, transformedResult);
          }
        });
      },
      projects: function(callback) {
        getProjectStats(function(err, result) {
          if (err) {
            callback(err);
          } else {
            var transformedResult = transformSeries(rFrom, rTo, result);
            callback(null, transformedResult);
          }
        });
      },
      ngos: function(callback) {
        getNgoStats(function(err, result) {
          if (err) {
            callback(err);
          } else {
            var transformedResult = transformSeries(rFrom, rTo, result);
            callback(null, transformedResult);
          }
        });
      }
    }, next);
  },
  getTopUserStatistics: function(next) {
    db = global.db;
    async.parallel({
      skills: function(callback) {
        getTopSkills(callback);
      },
      projectSkills: function(callback) {
        getTopProjectSkills(callback);
      },
      industries: function(callback) {
        getTopIndustries(callback);
      },
      companies: function(callback) {
        getTopCompanies(callback);
      },
      countries: function(callback) {
        getTopCountries(callback);
      },
      educations: function(callback) {
        getTopEducations(callback);
      }
    }, next);
  },
  getCountryCodes: function(next) {
    db = global.db;
    db.collection("users").distinct("linkedin.countryCode", next);
  }
};
