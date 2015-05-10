var mongoose = require('mongoose');

var projectCommentsSchema = mongoose.Schema({
    projectShortName: {
        type: String,
        unique: true
    },
    comments: [{
        _id: false,
        user: {
            _id: false,
            shortId: String,
            firstName: String,
            lastName: String,
            pictureUrl: String
        },
        text: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('ProjectComments', projectCommentsSchema);
