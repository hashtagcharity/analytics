var mongoose = require('mongoose');

var InterestSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('Interest', InterestSchema);
