var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var causeSchema = mongoose.Schema({
    urlName: String,
    name: String,
    shortDescription: String,
    longDescription: {
        part_1: String,
        part_2: String,
        part_3: String
    },
    projectCounter: Number,
    ngoCounter: Number,
    followerCounter: Number,
    slides: [{
        _id: false,
        id: ObjectId,
        imageLink: String
    }],
    followers: [{
        _id: false,
        id: ObjectId,
        name: String
    }],
    ngos: [{
        _id: false,
        id: ObjectId,
        name: String
    }],
    projects: [{
        _id: false,
        id: ObjectId,
        name: String
    }]
});


module.exports = mongoose.model('Cause', causeSchema);
