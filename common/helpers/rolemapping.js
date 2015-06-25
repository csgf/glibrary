/**
 * Created by hellbreak on 06/06/15.
 */


module.exports = function RoleTools(app){

  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  return {
    checkModelRole: function (app, data, cb) {

      var value = false;
      /*
       controllo che il campo ownerId del modello repository sia uguale al campo userId all'interno
       del ctx.request.accessToken
       */
      RoleMapping.findOne({
        where: {
          principalType: data.principalType_value,
          principalId: data.principalId_value,
          userId: data.userId
        }
      }, function (err, role) {
        if (err) throw err;
        if (role) {
          console.log("[boot_repository][AccessGranted]:", role);
          return cb(true);
        } else {
          console.log("[boot_repository][AccessDeny]:", role);
          return cb(value)
        }

      })
    },
    assignRoleToModel : function(data, cb) {
      Role.findOne({
        where: {
          name: 'repositoryOwner'
        }
      }, function (err, role) {
        if (err) throw err;
        if (role) {
          role.principals.create({
            principalType: data.principalType_value,
            principalId: data.principalId_value,
            userId: data.owner_id
          }, function (err, p) {
            if (err) throw err;
            else return cb(true)
          });
        } else {
          console.log("No Role found");
          return cb(false);
        }
      });
    }

  }
}
