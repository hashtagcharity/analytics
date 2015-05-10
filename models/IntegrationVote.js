var mongoose = require('mongoose');

var integrationVoteSchema = mongoose.Schema({
    emailAddress: String,
    votes: {
        googleDrive: Boolean,
        slack: Boolean,
        dropbox: Boolean,
        prezi: Boolean,
        targetprocess: Boolean,
        github: Boolean,
        bitbucket: Boolean,
        trello: Boolean
    }
});

module.exports = mongoose.model('IntegrationVote', integrationVoteSchema);
