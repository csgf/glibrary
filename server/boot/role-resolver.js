/**
 * Created by Antonio Di Mariano on 19/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

module.exports = function (app) {

  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

/*
  Role.registerResolver('admin', function (role, context, cb) {
    function reject() {
      process.nextTick(function () {
        cb(null, false);
      });
    }

    function procedi() {
      process.nextTick(function () {
        cb(null, true);
      });

    }
    if ( context.remotingContext.req.params.repo_name != 'undefined' ) {
      console.log("context.remotingContext.req.params.repo_name",context.remotingContext.req.paramsgit )
      console.log("ROLE RESOLVER -> USERID:",context.accessToken.userId);
      if ( context.accessToken.userId && context.accessToken.userId == '5624f426342cccb8acfe6f97')
      {
        console.log("I am Nathan Never");
        return procedi()
      }
      else return reject()

    } else
    {
      console.log("REPOSITORY DA CARICARE")
    }

  })

*/

  /*
    Role.registerResolver('repoA', function (role, context, cb) {
      function reject() {
        process.nextTick(function () {
          cb(null, false);
        });
      }

      if ( context.remotingContext.req.params.repo_name == 'contea' ) {

        console.log("MODEL:",app.model['Contea'])

      }

      // if the target model is not project
      if (context.modelName !== 'contea') {
        console.log("CONTEXT",context.remotingContext.req.params)

        console.log("!contea", context.modelName);
        return reject();
      } else {
        console.log("CONTEA",context.modelName);
      }

    })

    */

}
