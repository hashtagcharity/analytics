var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId;

var validStatuses = ['draft', 'pending', 'active'];

var ngoSchema = mongoose.Schema({
    shortName: {
        type: String,
        unique: true
    },
    name: String,
    status: {
        type: String,
        enum: validStatuses
    },
    shortDesc: String,
    logo: String,
    cardHeader: String,
    pageHeader: String,
    rate: Number,
    overview: String,
    location: {
        placeId: String,
        placeName: String,
        lat: String,
        lng: String
    },
    web: String,
    email: String,
    search: {
        _id: false,
        name: String
    },
    impacts: [{
        _id: false,
        title: String,
        text: String
    }],
    socials: {
        _id: false,
        facebook: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        },
        twitter: {
            type: String,
            default: ''
        },
        charitynav: {
            type: String,
            default: ''
        }
    },
    admin: {
        _id: false,
        shortId: String,
        firstName: String,
        lastName: String,
        pictureUrl: String
    },
    followers: [{
        _id: false,
        id: ObjectId,
        name: String
    }],
    projects: [{
        _id: false,
        id: ObjectId,
        name: String
    }],
    numberOfCares: Number,
    featuredSince: Date,
    createdOn: {
        type: Date,
        default: Date.now
    }
});
ngoSchema.index({
    status: 1,
    featuredSince: -1,
    "search.name": 1
});
ngoSchema.methods.toCardStyle = function() {
    return {
        id: this.id,
        name: this.name,
        shortName: this.shortName,
        location: this.location,
        rate: this.rate,
        logo: this.logo,
        adminShortId: this.admin.shortId,
        managedBy: this.admin ? this.admin.firstName + " " + this.admin.lastName : "",
        cardHeader: this.cardHeader ? this.cardHeader : "",
        cares: this.numberOfCares,
        shortDescription: this.shortDesc,
        featuredSince: this.featuredSince
    };
};

module.exports = mongoose.model('Ngo', ngoSchema);

module.exports.validStatuses = validStatuses;
