/**
 * Created by Antonio Di Mariano on 29/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var lt = require('loopback-testing');
var app = require('../server.js');
var assert = require('assert');

var url = '/v2/repos/';

/*--------------------- Repository with local mongodb default DS ------------------------------------*/

var local_repo = {
  "name": "contea"
}

var local_collection = {
  "name": "mycoll1"
}

var local_collection2 = {
  "name": "123mycoll"

}

var local_collection3 = {
  "name": "123_collection"
}

var local_collection4 = {
  "name": "collection_name"
}

var local_collection5 = {
  "name": "collection_name_123"
}
var local_collection6 = {
  "name": "collection_name_123_"
}
var local_collection7 = {
  "name": "collection_name_"
}

var coll_data_1 = {
  "title": "first item",
  "location": "my location"
}

describe('Creating local Collection with local Repository  ', function () {
  lt.beforeEach.withApp(app);


  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection.name, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection2, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection2.name, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection3, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection3.name, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection4, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection4.name, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection5, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection5.name, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection6, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection6.name, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name, local_collection7, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection7.name, function () {
    lt.it.shouldBeAllowed()
  })

})


describe('Insert items to local Collection  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection2.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection2.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection3.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection3.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection4.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection4.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection5.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection5.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection6.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection6.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST', url + local_repo.name + '/' + local_collection7.name, coll_data_1, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/' + local_collection7.name + '?filter[where][title]=' + coll_data_1.title, function () {
    lt.it.shouldBeAllowed()
  })


})


/*--------------------- Repository with postgresql default DS------------------------------------*/


postgresql_repo_wrong1 = {
  "nam": "repo"
}

postgresql_repo_wrong2 = {
  "name_": "repo"
}
postgresql_repo_wrong3 = {
  "name": "repo_"
}
postgresql_repo_wrong4 = {
  "name": "repo$"
}
postgresql_repo_wrong5 = {
  "name": "repo/"
}


var postgresql_repo = {
  "name": "problems",
  "coll_db": {
    "host": "fiqurinia.com",
    "port": "5432",
    "username": "glibrary",
    "password": "nathan_never",
    "database": "glibrary",
    "type": "postgresql"
  }
}
var postgresql_coll1 = {
  "name": "collection12"
}

var postgresql_coll2 = {
  "name": "123mycoll"

}

var postgresql_coll3 = {
  "name": "123_collection"
}

var postgresql_coll4 = {
  "name": "collection_name"
}

var postgresql_coll5 = {
  "name": "collection_name_123"
}
var postgresql_coll6 = {
  "name": "collection_name_123_"
}
var postgresql_coll7 = {
  "name": "collection_name_"
}

var postgresql_coll8 = {
  "name": "pippo_"
}


var data_coll_a = {
  "firstname": "White Tiger"
}
var data_coll_b = {
  "myproperty": "LION 2"
}


describe('Creating local Repositories with bad parameters  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url, postgresql_repo_wrong1, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })


  lt.describe.whenCalledRemotely('POST', url, postgresql_repo_wrong2, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('POST', url, postgresql_repo_wrong3, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('POST', url, postgresql_repo_wrong4, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('POST', url, postgresql_repo_wrong5, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);

    });
  })

})

describe('Creating local Repository with good parameters  ', function () {
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('POST', url, postgresql_repo, function () {
    lt.it.shouldBeAllowed()
  })


})

describe('Trying to create a duplicate local Repository', function () {
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('POST', url, postgresql_repo, function () {
    it('should have statusCode 409', function () {
      assert.equal(this.res.statusCode, 409);
    });
  })

})

describe('Creating postgresql Collections with good parameters  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll1, function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll1.name, function () {
    lt.it.shouldBeAllowed()
  })


  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll2, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll2.name, function () {
    lt.it.shouldBeAllowed()
  })


})

describe('Trying to create duplicate postgresql Collections  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll1, function () {
    it('should have statusCode 409', function () {
      assert.equal(this.res.statusCode, 409);
    });
  })
})

describe('Creating postgresql Collections with bad parameters  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll3, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll3.name, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll4, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll4.name, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll5, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll5.name, function () {
    lt.it.shouldNotBeFound()
  })


  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll6, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll6.name, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll7, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll7.name, function () {
    lt.it.shouldNotBeFound()
  })


  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name, postgresql_coll8, function () {
    it('should have statusCode 400', function () {
      assert.equal(this.res.statusCode, 400);
    });
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll8.name, function () {
    lt.it.shouldNotBeFound()
  })

})

describe('Insert items to allowed postgresql Collections  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll1.name, data_coll_a, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll1.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll2.name, data_coll_a, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll2.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldBeAllowed()
  })
})


describe('Insert items with a wrong property to allowed postgresql Collections  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll1.name, data_coll_b, function () {
    it('should have statusCode 422', function () {
      console.log("THIS:", this.res);
      assert.equal(this.res.statusCode, 422);
    });
  })

})


describe('Insert items to no existing Collections  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll3.name, data_coll_a, function () {
    lt.it.shouldNotBeFound()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll3.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll4.name, data_coll_a, function () {
    lt.it.shouldNotBeFound()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll4.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldNotBeFound()
  })


  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll5.name, data_coll_a, function () {
    lt.it.shouldNotBeFound()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll5.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll6.name, data_coll_a, function () {
    lt.it.shouldNotBeFound()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll6.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldNotBeFound()
  })

  lt.describe.whenCalledRemotely('POST', url + postgresql_repo.name + '/' + postgresql_coll7.name, data_coll_a, function () {
    lt.it.shouldNotBeFound()
  })
  lt.describe.whenCalledRemotely('GET', url + postgresql_repo.name + '/' + postgresql_coll7.name + '?filter[where][firstname]=' + data_coll_a.title, function () {
    lt.it.shouldNotBeFound()
  })
})
