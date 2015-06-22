var mongoose = require('mongoose');
var shortId = require('shortid');
var TaskType = require('./Task').schema;

var validStatuses = ['draft', 'pending', 'active', 'closed'];
var validTypes = ['general', 'idea'];

var UserType = mongoose.Schema({
  _id: false,
  shortId: String,
  firstName: String,
  lastName: String,
  pictureUrl: String,
  slackName: String
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

var MileStoneItem = mongoose.Schema({
  _id: false,
  shortId: {
    type: String,
    unique: true,
    sparse: true,
    default: shortId.generate,
  },
  rank: {
    type: Number,
    default: 0
  },
  name: String,
  description: String,
  done: false
});

var linkItem = mongoose.Schema({
  _id: false,
  shortId: {
    type: String,
    unique: true,
    sparse: true,
    default: shortId.generate,
  },
  shortName: String,
  linkUrl: String
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
    pictureUrl: String,
    slackName: String
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
  resultUrl: String,
  impact: {
    directImpact: String,
    savedMoney: String,
    savingImpact: String
  },
  cause: String,
  fileStore: {
    _id: false,
    maxSize: {
      type: Number,
      default: 50
    },
    files: [FileType]
  },
  mileStones: [MileStoneItem],
  links: [linkItem],
  team: {
    _id: false,
    maxMembers: {
      type: Number,
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
  numberOfCares: {
    type: Number,
    default: 0
  },
  staffPicked: false,
  ngo: {
    _id: false,
    shortName: String,
    name: String,
    logo: String
  },
  dueDate: {
    type: Date
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  slackId: String
});

projectSchema.virtual('progress').get(function() {
  var progress = 0,
    allMilestones = this.mileStones.length,
    doneMilestones = 0;
  for (var i = 0; i < allMilestones; ++i) {
    if (this.mileStones[i].done) {
      doneMilestones = doneMilestones + 1;
    }
  }

  if (allMilestones !== 0) {
    progress = parseInt(doneMilestones * 100 / allMilestones);
  }
  return progress;
});

projectSchema.virtual('slack.channel').get(function() {
  var channelName = ("pr_" + this.shortName);

  return channelName.substring(0, Math.min(channelName.length, 21));
});

projectSchema.virtual('dueDateInDays').get(function() {
  if (this.dueDate && this.dueDate > new Date()) {
    return Math.round((this.dueDate - new Date()) / (1000 * 60 * 60 * 24));
  } else {
    return 0;
  }

});

projectSchema.methods.toCardStyle = function() {
  return {
    id: this.id,
    projectType: this.type,
    shortName: this.shortName,
    name: this.title,
    location: this.location,
    ownerName: this.owner ? this.owner.firstName + " " + this.owner.lastName : "",
    ownerShortId: this.owner ? this.owner.shortId : "",
    cares: this.numberOfCares,
    dueDate: this.dueDate,
    dueDateInDays: this.dueDateInDays,
    ngoName: this.ngo.name,
    ngoShortName: this.ngo.shortName,
    impact: "Normal",
    team: this.team.members,
    progress: this.progress,
    cardHeader: this.cardHeader,
    shortDescription: this.shortDescription,
    skills: this.skills,
    memberCount: this.team.members.length,
    maxMembers: this.team.maxMembers,
    numberOfCares: this.numberOfCares,
    resultUrl: this.resultUrl
  };
};

projectSchema.index({
  status: 1,
  "search.title": 1
});

module.exports = mongoose.model('Project', projectSchema);

module.exports.validStatuses = validStatuses;
module.exports.validTypes = validTypes;
