var mongoose = require('mongoose'),
    shortId = require('shortid'),
    ObjectId = mongoose.Schema.ObjectId;

var ngoApprovalRequestSchema = mongoose.Schema({
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
    featured: false,
    projects: [{
        _id: false,
        id: ObjectId,
        name: String
    }],
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

module.exports = mongoose.model('NgoApprovalRequest', ngoApprovalRequestSchema);
