gLibrary 2.0
============

gLibrary is a service that offers both access to existing data repositories and creation of new ones via a simple REST API.

A **repository** in the gLibrary lingo is a virtual container of one or more data **collection**. 

A **collection** provides access to a relational db table or non-relational db collection. Currenly gLibrary supports MySQL, PostgreSQL, Oracle and MongoDB. 

Each repository can group together one of more collections, coming from different databases and different types (for example one collection provides access to a PostGreSQL table and another to a MongoDB collection).

Once collections are imported or created from scratch, they can be queried with a powerful filtering system. All the criteria are specified using the query string of the API call. (ex `/v1/repos/fantasy_company/orders?filter[where][userId]=acaland&filter[where][orderQuantity][gt]=200&filter[where][limit]=100` will search for 100 orders issued by the user `acaland` with a quantity of 100)

**Relations** between two collections of the same repository can be created, if foreign keys are properly assigned. Currently we support one-to-many relations.

We refer to all the records of collections with the term **items**.

Each item can have one or more *attachment*, that we call **replicas**. Replicas can be stored on Grid Storage Elements (Disk Pool Manager) or Cloud Storage (OpenStack Swift is supported). 

REST API v2.0 (Draft)
---------------------

### Testing endpoint

> http://glibrary.ct.infn.it:5000

#### Repositories

A gLibrary server can host one or more **repositories**. A repository should be created before to create new **collections** or import existing db tables or nosql collections as gLibrary collection. 

A repository has a `name`, a `path`, that rapresents the endopoint in the API path, and optionally a `default_collection_db`. If a default DB is defined at the moment of the creation, this will be the default backend for all the collections created or imported of the repository. However, this can be ovverridden per each collection, if a new DB info is provided when the collection is created 


### List of all the repositories hosted on the server

```http
GET /v1/repos/ HTTP/1.1
```

Returns a list of all the repositories managed by the server. Each
repository has the following properties:

|  name                   |  description    
|------------------------ |------------------------------------------------------------------------------------------ |   
| name                    |  Repository name                                                                          |
| path                    |  Direct endpoint of the given repository                                                  |
| default_collection_db   |  Default database where collection data should be stored. Can be overriden per collection |   
| host                    |  FQDN of the default collection DB                                                        |
| port                    |  port number of the default collection DB                                                 |
| username                |  username of the default collection DB                                                    |
| password                |  password of the default collection DB                                                    |
| database                |  name of the database to use for the default collection DB                                |
| type                    |  type of the default collection db (mysql, postgresql, mongodb)                           |


Example:

```json
{
    "name": "sports",
    "path": "http://glibrary.ct.infn.it:5000/v1/sports",
    "default_coll_db": {
        "host": "giular.trigrid.it",
        "port": 3306,
        "username": "root",
        "password": "p1pp01234",
        "database": "test",
        "type": "mysql"
    }
}
```

Each repository can have a default_collection_db where collections
data will be stored. If no default_collection_db is specified, the
repository will use the local non-relational mongoDB. Each repository's
collection can override the default_collection_db.

### Create a new repository

```http
POST /v1/repos/ HTTP/1.1
```

Create a new repository. A default\_collection\_db can be specified. It
will store all the collections in case no collection\_db parameter is
specifie during collection creation. This property is optional. If
missing it will use the local MongoDB.

**Parameters**

  name                      | type    | description
  ------------------------- |-------- | -----------------------------------------------------------------------------------------------------
  name                      | string  | Name of the repository (will be the API path)
  default\_collection\_db   | string  | (Optional) Default database where collection data should be stored. <br>Can be overriden per collection
  host                      | string  | FQDN of the default collection DB
  port                      | number  | port number of the default collection DB
  username                  | string  | username of the default collection DB
  password                  | string  | password of the default collection DB
  database                  | string  | name of the database to use for the default collection DB
  type                      | string  | type of the default collection db (mysql, postgresql, mongodb)

Note: name is a lowercase string. Numbers are allowed. No special
characters are allowed

Example:

```json
{
    "name": "sports",
    "default_coll_db": {
        "host": "glibrary.ct.infn.it",
        "port": 5432,
        "username": "sports_admin",
        "password": "sp0rt1ng",
        "database": "sports_db",
        "type": "postgresql"
    }
}
```

Be sure to set Content-Type to application/json in the *Request
Headers*.

#### Collections

Each repository contains one or more collections. Collections can be
used to map relational database tables or non-relation database
"collections". The available APIs allows to create new collection,
specifying a schema in the case of relational collection, or importing
existing tables/collections. If not specified, collections will be
imported from the default\_collection\_db of the containing repository.
Otherwise, each collection can retrieve data from local or remote
database, overring the defaul repository value, using the collection\_db
property.

### Create a new collection

```http
POST /v1/repos/<repo_name>/ HTTP/1.1
```

**Parameters**

  name             | type     | description
  ---------------- | -------- | -----------------------------------------------------------------------------------------------------
  name             | string   | Name of collection
  schema           | object   | (Optional for non relational DB) define the schema of the new collection
  collection_db    | string   | (Optional) Default database where collection data should be stored. <br>Can be overriden per collection
  host             | string   | FQDN of the default collection DB
  port             | number   | port number of the default collection DB
  username         | string   | username of the default collection DB
  password         | string   | password of the default collection DB
  database         | string   | name of the database to use for the default collection DB
  type             | string   | type of the default collection db (mysql, postgresql, mongodb)

Schema is a JSON object listing the the name of the attributes and their
types in case we want a non-relational collection. Each property
represents the name of an attribute and the value is another object with
the following keys:

  name       | description
  ---------- |------------------------------------------------------------------------------------------------
  type       | type of the attribute's value. Example of allowed types are: string, number, 'boolean', 'date'
  required   | whether a value for the property is required
  default    | default value for the property
  id         | whether the property is a unique identifier. Default is false

For a full list of the supported type, please refer to
<https://docs.strongloop.com/display/public/LB/LoopBack+types> and
<https://docs.strongloop.com/display/public/LB/Model+definition+JSON+file#ModeldefinitionJSONfile-Generalpropertyproperties>.

Example:

```json
{
    "name": "movies",
    "schema": {
        "name": {"type": "string", "required": true},
        "duration": "integer",
        "actors": "array"
    }
}
```

Crea una nuova collection o importa una tabella di un db esistente come
collection nel repository &lt;repo\_name&gt;. Il nome della collections
viene passato come parametro nel body

```http
GET /v1/repos/<repo_name>/ HTTP/1.1
```

Elenco di tutte le collection del repository &lt;repo\_name&gt;

```http
HEAD /v1/repos/<repo_name>/<collection_name> HTTP/1.1
```

Restituisce i metadati della collection &lt;collection\_name&gt; del
repository &lt;repo\_name&gt;

```http
DELETE /v1/repos/<repo_name>/<collection_name> HTTP/1.1
```

Cancella la collection &lt;collection\_name&gt;

```http
PUT /v1/repos/<repo_name>/<collection_name> HTTP/1.1
```

Modifica i metadati della &lt;collection\_name&gt;

#### Items (previously entries)

```http
POST /v1/repos/<repo_name>/<collection_name>/ HTTP/1.1
```

Crea un nuovo item nella collection &lt;collection\_name&gt; con tutti i
suoi metadati

```http
GET /v1/repos/<repo_name>/<collection_name>/ HTTP/1.1
```

Elenco di tutti gli item contenuti nella collection
&lt;collection\_name&gt;

```http
HEAD /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1
```

Restituisce i metadati dell'item con id &lt;item\_id&gt;, incluse le sue
eventuali repliche

```http
DELETE  /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1
```

Cancella l'item indicato

```http
PUT /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1
```

Modifica i metadati dell'item indicato

{da discutere} supporto multilingua ai metadati

```http
HEAD /v1/repos/<repo_name>/<collection_name>/<item_id>/i18n/<lang_code> HTTP/1.1
```

Restituisce i metadati nella lingua specificata

{da discutere} Related items - next release

```http
GET /v1/repos/<repo_name>/<collection_name>/<item_id>/<related_collection_name> HTTP/1.1
```

Restituisce tutti gli item relativi all'idem\_id indicato nella
&lt;related\_collection\_name&gt;

#### Replicas

```http
POST /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/ HTTP/1.1
```

Crea una replica per l'item\_id indicato. Restituisce la URL dello
storage su cui effettuare un direct upload con operazione di POST o PUT
entro pochi secondi

```http
GET /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/<rep_id> HTTP/1.1
```

Restituisce la URL dello storage da cui effettuare un direct download
della replica indicata del item con &lt;item\_id&gt;
