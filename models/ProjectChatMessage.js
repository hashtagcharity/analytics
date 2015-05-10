var mongoose = require('mongoose');

// should be converted to bucketed approach for better performance. i.e. _id: (shortName,bucketId)
var projectChatMessageSchema = mongoose.Schema({
    projectShortName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    user: {
        _id: false,
        shortId: String,
        firstName: String,
        lastName: String,
        pictureUrl: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ProjectChatMessage', projectChatMessageSchema);
