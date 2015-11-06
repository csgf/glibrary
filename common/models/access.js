module.exports = function(Access) {

  var error = require('../helpers/errorResponse');

  var checkForDuplicate = function(context,next) {
    Access.findOne(
      {
        where: {
          and: [
            {"userId": context.instance.userId},
            {"repositoryName": context.instance.repositoryName},
            {"collectionName": context.instance.collectionName }

          ]
        }
      },function(err,duplicate){
        if(err) return next(500);
        if(duplicate) return next(409);
        if(!duplicate) return next(0);
      }
    )

  }
  Access.observe('before save', function (context, final) {
    console.log('[Access][before save]', context.instance);
    if (!context.instance.collectionName) {
      console.log("[Access][collectionName setted to null]");
      context.instance.collectionName = null;
    }
    checkForDuplicate(context,function(duplicate){
      if(duplicate == 409) {
        error_msg = error.sendError(409, 'Duplicate AccessRule Entry')
        final(error_msg);
      }
      if(duplicate == 500) {
        error_msg = error.sendError(500, 'Error during checkForDuplicate')
        final(error_msg)
    }
      if(duplicate == 0) {
        final()
      }
    })
  })

};
