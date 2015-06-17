module.exports = function(app) {
  var collections = [
    {name: 'tony', path: 'path1',table:'table', repoId: 'verga'},
    {name: 'Product2', path: 'path2', repoId: 'verga'},
    {name: 'Product5', path: 'path3', repoId : 'tony'}
  ];

  var count = collections.length;

  collections.forEach(function(collection) {
    app.models.Collection.create(collection, function(err, instance) {
      if (err)
        return console.log(err);

      console.log('Collection created:', instance);

      count--;

      if (count === 0)
        console.log('done');
    });
  });

  // stabilisco relazione con modello repository
  collectionModel = app.models.Collection;
  repositoryModel = app.models.Repository;


   repositoryModel.hasMany(collectionModel,{foreignKey: 'repoId', as: 'collections'})
  console.log("Relazione creata");
}




