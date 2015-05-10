var mongoose = require('mongoose');

var smartMatchSchema = mongoose.Schema({
    userId: String,
    projectShortName: String,
    impactNumber: Number,
    impact: String,
    calculatedAt: {
        type: Date,
        default: Date.now
    }
});

smartMatchSchema.index({
    userId: 1
});

smartMatchSchema.index({
    projectShortName: 1,
    userId: 1
});
smartMatchSchema.statics.getDefaultImpact = function() {
    return "Normal";
};
module.exports = mongoose.model('SmartMatch', smartMatchSchema);
