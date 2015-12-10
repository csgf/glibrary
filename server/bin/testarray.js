/**
 * Created by Antonio Di Mariano on 10/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var _ = require('underscore')
someArray = {

  "name": "lezioni",

  "name": "programmazione_c",

  "repositoryName": [
    {
      "name": "fishes"
    },
    {
      "name": "my_garage"
    }
  ],
  "collectionName": [
    {
      "name": "sharks"
    },
    {
      "name": "my_bike"
    }
  ]
}

function findAndRemove(array, property, value) {
  console.log("array",array);

  console.log("property",property);

  console.log("value",value);

  array.forEach(function(result, index) {
    if(result[property] === value) {
      //Remove from array
      array.splice(index, 1);
    }
  });
}

//Checks countries.result for an object with a property of 'id' whose value is 'AF'
//Then removes it ;p
findAndRemove(someArray.repositoryName,'name', 'fishes');


console.log("ARRAY", someArray)
