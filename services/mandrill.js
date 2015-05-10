var config = global.config;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);
var _ = require('lodash');

function extractRecipients(recipientsWithModel) {
  var transformedTo = _.map(recipientsWithModel, function(r) {
    return {
      email: r.to
    };
  });
  return transformedTo;
}

function transformModelToMergeVars(model) {
  var mergeVars = [];
  for (var key in model) {
    if (model.hasOwnProperty(key)) {
      mergeVars.push({
        name: key,
        content: model[key]
      });
    }
  }
  return mergeVars;
}

function transformPayload(recipientsWithModel) {
  var mergeVars = _.map(recipientsWithModel, function(r) {
    return {
      rcpt: r.to,
      vars: transformModelToMergeVars(r.model)
    };
  });
  return mergeVars;
}

module.exports = {
  ping: function(next) {
    mandrill_client.users.ping(function(info) {
      console.log('Reputation: ' + info.reputation + ', Hourly Quota: ' + info.hourly_quota);
    });
  },
  sendTemplatedMail: function(templateName, recipientsWithModel, next) {
    var message = {
      to: extractRecipients(recipientsWithModel),
      merge_vars: transformPayload(recipientsWithModel),
    };
    mandrill_client.messages.sendTemplate({
      template_name: templateName,
      template_content: [],
      message: message,
      async: true
    }, function(result) {
      next(null, result);
    }, function(err) {
      next(err);
    });
  }
};
