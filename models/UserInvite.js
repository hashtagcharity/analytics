var mongoose = require('mongoose');

var userInviteSchema = mongoose.Schema({
    user: {
        _id: false,
        shortId: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        pictureUrl: {
            type: String,
            required: true
        }
    },
    invitedEmail: {
        type: String,
        required: true
    },
    registered: {
        type: Boolean,
        default: false
    },
    startedProject: {
        type: Boolean,
        default: false
    },
    joinedProject: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('UserInvite', userInviteSchema);