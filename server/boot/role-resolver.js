module.exports = function(app) {
  var Role = app.models.Role;

  Role.registerResolver('teamMember222', function(role, context, cb) {


    function reject() {
      process.nextTick(function() {
        cb(null, false);
      });
    }

    // if the target model is not project
    if (context.modelName !== 'project') {
      return reject();
    }


    // do not allow anonymous users
    var userId = context.accessToken.userId;
    if (!userId) {
      return reject();
    }

    // check if userId is in team table for the given project id
    context.model.findById(context.modelId, function(err, project) {
      if (err || !project)
        return reject();
      console.log("context.model.findById", context.modelName,context.modelId, role);
      var Team = app.models.Team;
      Team.count({
        ownerId: project.ownerId,
        memberId: userId
      }, function(err, count) {
        if (err) {
          console.log(err);
          return cb(null, false);
        }

        cb(null, count > 0); // true = is a team member
      });
    });
  });

  Role.registerResolver('repositoryMember',function(role,context,cv){
    /*
    context.model.find(context,function(err, repo){
      if (err) console.log("ERRORE FIND");
      console.log("repository FIND",context.modelName,role);
    });

    */

    context.model.findById(context.modelId, function(err, repository) {
      if (err || !repository)
        console.log("ERRORE");
      console.log("repositoryMember Context", context.modelName,context.modelId, role);

    });
  })

}
