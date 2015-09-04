/**
 * Created by Antonio Di Mariano on 03/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
//            collectionModel.hasMany(replica,{foreignKey: 'collectionId', as: 'collections'})
var logger = require("./logger");


module.exports = function (app) {
  var Replica = app.models.Replica;

  return {

    setRelation: function setRelation(req, res, next) {

      next.module.hasMany(Replica, {foreignKey: 'collectionId', as: 'replicas'});

      next.module.find({
        include: 'replicas',

      },function(err,result){
        if(err) console.log(err);
        console.log("MIDDLE",result)
      })
      logger.debug("[modelRelation][Setted hasMany replica]");
      next();
      /*
      next.module.find(req.query.filter, function (err, instance) {
        if (err) res.sendStatus(500);
        if (!instance) return res.sendStatus(404);
        console.log("MIDDLEWARE: ", instance);
      })
      */


    }
  }
}
