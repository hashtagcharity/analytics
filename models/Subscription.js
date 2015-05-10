var mongoose = require('mongoose');

var subscriptionSchema = mongoose.Schema({
    emailAddress: String,
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);