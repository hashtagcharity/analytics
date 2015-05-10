var mongoose = require('mongoose');

var skillSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Skill', skillSchema);
