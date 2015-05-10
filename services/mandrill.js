var config = global.config;
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.mandrill.apiKey);

module.exports = {
  ping: function(next) {
    mandrill_client.users.ping(function(info) {
      console.log('Reputation: ' + info.reputation + ', Hourly Quota: ' + info.hourly_quota);
    });
  },
  sendCustomMail: function(message, next) {
    mandrill_client.messages.send({
      message: message,
      async: true
    }, function(result) {
      next(null, result);
    }, function(err) {
      next(err);
    });
  },
  sendExampleMail: function(next) {
    var message = {
      "html": "<p>Example HTML content</p>",
      "text": "Example text content",
      "subject": "Helló world",
      "from_email": "balazs.mate@hashtagcharity.org",
      "from_name": "Balázs Máté",
      "to": [{
        "email": "balazs.mate@hashtagcharity.org",
        "name": "Balázs Máté",
        "type": "to"
      }],
      "global_merge_vars": [{
        "name": "notificationTitle",
        "content": "hello world"
      }, {
        "name": "text",
        "content": "műxik"
      }]
    };
    mandrill_client.messages.sendTemplate({
      template_name: "subscriptiontemplate",
      template_content: [],
      message: message,
      async: true
    }, function(result) {
      next(null, result);
    }, function(err) {
      next(err);
    });
  },
  sendTemplatedMail: function(next) {

  }
};
