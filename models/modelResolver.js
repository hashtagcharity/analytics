exports.mapModels = function() {
  global.models = global.models || {};
  global.models.User = require('./User');
  global.models.Ngo = require('./Ngo');
  global.models.Cause = require('./Cause');
  global.models.Project = require('./Project');
  global.models.Subscription = require('./Subscription');
  global.models.IntegrationVote = require('./IntegrationVote');
  global.models.Skill = require('./Skill');
  global.models.ProjectComments = require('./ProjectComments');
  global.models.ProjectApprovalRequest = require('./ProjectApprovalRequest');
  global.models.NgoApprovalRequest = require('./NgoApprovalRequest');
  global.models.ProjectChatMessage = require('./ProjectChatMessage');
  global.models.ProjectTaskComments = require('./ProjectTaskComments');
  global.models.SmartMatch = require('./SmartMatch');
  global.models.UserInvite = require('./UserInvite');
  global.models.Interest = require('./Interest');
};
