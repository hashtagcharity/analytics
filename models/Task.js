var mongoose = require('mongoose');
var shortId = require('shortid');

var UserType = mongoose.Schema({
  _id: false,
  shortId: String,
  firstName: String,
  lastName: String,
  pictureUrl: String
});

var taskSchema = mongoose.Schema({
  _id: false,
  shortId: {
    type: String,
    unique: true,
    sparse: true,
    default: shortId.generate
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  members: [UserType],
  created: {
    _id: false,
    at: Date,
    by: {
      _id: false,
      shortId: String,
      firstName: String,
      lastName: String,
      pictureUrl: String
    }
  },
  due: Date
});

module.exports = mongoose.model('Task', taskSchema);
