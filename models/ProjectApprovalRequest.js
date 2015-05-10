var mongoose = require('mongoose'),
    shortId = require('shortid');

var projectApprovalRequestSchema = mongoose.Schema({
    shortId: {
        type: String,
        unique: true,
        sparse: true,
        default: shortId.generate
    },
    shortName: {
        type: String,
        required: true
    },
    numberOfCares: Number,
    featured: false,
    staffPicked: false,
    ngo: {
        _id: false,
        shortName: String,
        name: String,
        logo: String
    },
    team: {
        _id: false,
        maxMembers: Number,
        members: Number,
        waitlist: Number
    },
    tasks: {
        _id: false,
        todo: Number,
        doing: Number,
        done: Number
    },
    files: Number,
    issued: {
        _id: false,
        by: {
            _id: false,
            shortId: String,
            lastName: String,
            firstName: String,
            pictureUrl: String
        },
        on: {
            _id: false,
            type: Date,
            default: Date.now
        }
    },
    approved: {
        _id: false,
        by: {
            _id: false,
            shortId: String,
            lastName: String,
            firstName: String,
            pictureUrl: String
        },
        on: Date
    }
});

module.exports = mongoose.model('ProjectApprovalRequest', projectApprovalRequestSchema);
