var mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  ObjectId = mongoose.Schema.ObjectId,
  shortId = require('shortid'),
  bcrypt = require('bcrypt');

var emptyStringType = {
  type: String,
  default: ''
};

var toBoolType = function toBoolType(defaultValue) {
  return {
    type: Boolean,
    default: defaultValue
  };
};

var toTrueBoolType = function() {
  return toBoolType(true);
};

var userSchema = mongoose.Schema({
  earlyBird: Boolean,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  connectedAccounts: [{
    _id: false,
    type: String,
    url: String,
  }],
  shortId: {
    type: String,
    unique: true,
    default: shortId.generate
  },
  linkedin: {
    id: String,
    accessToken: String,
    refreshToken: String,
    email: String,
    firstName: String,
    lastName: String,
    summary: String,
    industry: String,
    industryGroup: String,
    location: String,
    countryCode: String,
    educations: [{
      _id: false,
      schoolName: String,
      fieldOfStudy: String
    }],
    interests: String,
    languages: [String],
    skills: [String],
    positions: [{
      _id: false,
      companyName: String,
      title: String
    }],
    pictureUrl: String
  },
  social: {
    _id: false,
    facebook: String,
    twitter: String,
    linkedin: String,
    github: String,
    googleplus: String
  },
  visibility: {
    email: toBoolType(false),
    summary: toTrueBoolType(),
    industry: toTrueBoolType(),
    location: toTrueBoolType(),
    educations: toTrueBoolType(),
    interests: toTrueBoolType(),
    languages: toTrueBoolType(),
    skills: toTrueBoolType(),
    positions: toTrueBoolType(),
    socials: toTrueBoolType()
  },
  roles: [{
    type: String,
    enum: ['staff']
  }],
  cares: {
    projects: [String],
    ngos: [String]
  },
  password: String,
  resetToken: String,
  slackName: String
});

userSchema.virtual('user_info')
  .get(function() {
    return {
      'shortId': this.shortId,
      'fullName': this.linkedin.firstName + ' ' + this.linkedin.lastName,
      'profilePictureUrl': this.linkedin.pictureUrl
    };
  });
userSchema.virtual('name').get(function() {
  return this.linkedin.firstName + ' ' + this.linkedin.lastName;
});
var SALT_WORK_FACTOR = 5;

userSchema.pre('save',
  function(next) {
    var user = this;

    if (!user.isModified('password')) {
      return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR,
      function(err, salt) {
        if (err) {
          return next(err);
        }

        bcrypt.hash(user.password, salt,
          function(err, hash) {
            if (err) {
              return next(err);
            }
            user.password = hash;
            next();
          });
      });
  });

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password,
    function(err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
};


module.exports = mongoose.model('User', userSchema);
