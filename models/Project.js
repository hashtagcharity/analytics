var mongoose = require('mongoose'),
    shortId = require('shortid');

var validStatuses = ['draft', 'pending', 'active', 'closed'];
var validTypes = ['general', 'idea'];

var UserType = mongoose.Schema({
    _id: false,
    shortId: String,
    firstName: String,
    lastName: String,
    pictureUrl: String
});

var FileType = mongoose.Schema({
    _id: false,
    shortId: {
        type: String,
        unique: true,
        sparse: true,
        default: shortId.generate,
    },
    name: String,
    mimeType: String,
    url: String,
    size: Number,
    path: String,
    source: {
        type: String,
        enum: ['dropbox']
    },
    modifiedAt: Date,
    version: String
});

var TaskType = mongoose.Schema({
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

var projectSchema = mongoose.Schema({
    shortName: {
        type: String,
        unique: true
    },
    title: String,
    cardHeader: String,
    pageHeader: String,
    location: {
        _id: false,
        placeId: String,
        placeName: String,
        lat: String,
        lng: String
    },
    status: {
        type: String,
        enum: validStatuses
    },
    type: {
        type: String,
        enum: validTypes,
        default: 'general'
    },
    owner: {
        _id: false,
        shortId: String,
        firstName: String,
        lastName: String,
        pictureUrl: String
    },
    search: {
        _id: false,
        title: String
    },
    shortDescription: String,
    longDescription: String,
    keywords: [String],
    skills: [String],
    repoUrl: String,
    fileStore: {
        _id: false,
        maxSize: {
            type: Number,
            default: 50
        },
        files: [FileType]
    },
    team: {
        _id: false,
        maxMembers: {
            type: Number,
            default: 3
        },
        members: [UserType],
        waitlist: [UserType]
    },
    tasks: {
        _id: false,
        todo: [TaskType],
        doing: [TaskType],
        done: [TaskType]
    },
    numberOfCares: Number,
    featuredSince: Date,
    staffPicked: false,
    ngo: {
        _id: false,
        shortName: String,
        name: String,
        logo: String
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    slackId: String
});

projectSchema.virtual('progress').get(function() {
    var progress = 0,
        allTask = this.tasks.todo.length + this.tasks.doing.length + this.tasks.done.length;
    if (allTask !== 0) {
        progress = parseInt(this.tasks.done.length * 100 / allTask);
    }
    return progress;
});

projectSchema.virtual('slack.channel').get(function() {
    var channelName = ("pr_" + this.shortName);

    return channelName.substring(0, Math.min(channelName.length, 21));
});

projectSchema.methods.toCardStyle = function() {
    return {
        id: this.id,
        shortName: this.shortName,
        name: this.title,
        location: this.location,
        ownerName: this.owner ? this.owner.firstName + " " + this.owner.lastName : "",
        ownerShortId: this.owner ? this.owner.shortId : "",
        cares: this.numberOfCares,
        ngoName: this.ngo.name,
        ngoShortName: this.ngo.shortName,
        impact: "Normal",
        progress: this.progress,
        cardHeader: this.cardHeader,
        shortDescription: this.shortDescription,
        featuredSince: this.featuredSince,
        skills: this.skills,
        memberCount: this.team.members.length,
        maxMembers: this.team.maxMembers
    };
};

projectSchema.index({
    status: 1,
    featuredSince: -1,
    "search.title": 1
});

module.exports = mongoose.model('Project', projectSchema);

module.exports.validStatuses = validStatuses;
module.exports.validTypes = validTypes;
