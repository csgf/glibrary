# gLibrary 2.0

## Overview

gLibrary is a service that offers both access to existing data repositories and creation of new ones via a simple REST API.

A **repository** in the gLibrary lingo is a virtual container of one or more data **collection**. 

A **collection** provides access to a relational DB table or to a non-relational (NoSQL) DB collection. Currenly gLibrary supports MySQL, PostgreSQL, Oracle and MongoDB. 

Each repository can group together one of more collections, providing a virtual and uniform interface to data tables coming from different databases that could be potentially of different types (for example one collection provides access to a PostGreSQL table and another to a MongoDB collection). JSON is used as the input and output data format.

Once collections are imported or created from scratch, the gLibrary RESTA APIs can be used to retrieve, create, update and delete collection's records, that in gLibrary lingo are called **items**. Moreover a powerful filtering system is available to make queries on collections. All the criteria are specified using the query string of the API GET call. (ex `/v1/repos/fantasy_company/orders?filter[where][userId]=acaland&filter[where][orderQuantity][gt]=200&filter[where][limit]=100` will search for 100 orders issued by the user `acaland` with a quantity of 100)

Each item can have one or more *attachment*, that we call **replica**. Replicas can be stored on Grid Storage Elements (Disk Pool Manager) or Cloud Storage (OpenStack Swift is supported). 

**Relations** between two collections of the same repository can be created, if foreign keys are properly assigned. Currently we support one-to-many relations.


### Testing endpoint

	http://glibrary.ct.infn.it:5000



## Repositories

A gLibrary server can host one or more **repositories**. A repository should be created before creating new **collections** or importing existing db tables or NoSQL collections as gLibrary collections. 

A repository has a `name`, a `path`, that rapresents the access point in the API path, and optionally a `coll_db` (_TODO_: rename as `default_collection_db`). If a default DB is defined at the moment of the creation, this will be the default backend DB for all the collections created or imported of the given repository. However, this can be ovverridden per each collection, if new DB info is provided when the collection is created 


### List of all the repositories hosted on the server

```http
GET /v1/repos/ HTTP/1.1
```

Returns a list of all the repositories managed by the given gLibrary server. Each
repository has the following properties:

|  name                   |  description    
|------------------------ |------------------------------------------------------------------------------------------ |   
| name                    |  Repository name                                                                          |
| path                    |  Direct endpoint of the given repository                                                  |
| coll\_db (_TODO_: default\_collection\_db)   |  Default database where collection data should be stored. Can be overriden per collection |   
| host                    |  FQDN of the default collection DB                                                        |
| port                    |  port number of the default collection DB                                                 |
| username                |  username of the default collection DB                                                    |
| password                |  password of the default collection DB                                                    |
| database                |  name of the database to use for the default collection DB                                |
| type                    |  type of the default collection db (mysql, postgresql, mongodb)                           |


Example:

```json
{
    "name": "infn",
    "path": "http://glibrary.ct.infn.it:5000/v1/infn",
    "coll_db": {
        "host": "giular.trigrid.it",
        "port": 3306,
        "username": "root",
        "password": "*************",
        "database": "test",
        "type": "mysql"
    }
}
```

Each repository can have a `coll_db` (_TODO_: `default_collection_db`) where collections
data will be stored. If no `coll_db` (_TODO_: `default_collection_db`) is specified, the
repository will use the local non-relational mongoDB that comes with gLibrary. Each repository's
collection can override the `coll_db` (_TODO_: `default_collection_db`).

### Create a new repository

```http
POST /v1/repos/ HTTP/1.1
```

Create a new repository. A default `coll_db` (_TODO_: `default\_collection\_db`) can be specified. It
will store all the collections in case no `coll\_db` (_TODO_: `collection_db`) parameter is
specified during collection creation. This property is optional. If
missing it will use the local MongoDB server.

**Parameters**

  name                      | type    | description
  ------------------------- |-------- | -----------------------------------------------------------------------------------------------------
  name                      | string  | Name of the repository (will be the API path)
  coll\_db (_TODO_: default\_collection\_db)   | string  | (Optional) Default database where collection data should be stored. <br>Can be overriden per collection
  host                      | string  | FQDN of the default collection DB
  port                      | number  | port number of the default collection DB
  username                  | string  | username of the default collection DB
  password                  | string  | password of the default collection DB
  database                  | string  | name of the database to use for the default collection DB
  type                      | string  | type of the default collection db (mysql, postgresql, mongodb)

Note: `name` is a lowercase string. Numbers are allowed. No special
characters are allowed

Example:


```json
POST /v1/repos/ HTTP/1.1
Content-Type: application/json

{
    "name": "infn",
    "default_coll_db": {
        "host": "glibrary.ct.infn.it",
        "port": 5432,
        "username": "infn_admin",
        "password": "******",
        "database": "infn_db",
        "type": "postgresql"
    }
}
```

Be sure to set `Content-Type` to `application/json` in the *Request
Headers*.

## Collections

Each repository contains one or more collections. Collections are abstractions over relational database tables or non-relational database "collections", exposing their records over REST APIs and JSON format. The available APIs allow the repository administrator to create new collection, specifying a schema in the case of relational collection, or importing existing tables/NoSQL collections. If not specified, collections will be
created/imported from the default `coll_db` (_TODO_: `default_collection_db`) of the containing repository.
Otherwise, each collection can retrieve data from local or remote database, overriding the defaul repository value, using the `coll_db` (_TODO_: `collection_db`) property.

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

**Example** (creation of a new collection on a relational db):

```json
POST /v1/repos/infn/ HTTP/1.1
Content-Type: application/json

{
    "name": "articles",
    "schema": {
        "title": {"type": "string", "required": true},
        "year": "integer",
        "authors": "array"
    }
}
```
The previous request will create a collection named `articles` into the `infn` repository. The collection data will be stored into the default `coll_db` specified for the `infn` repository (that according to the previous example is a postgreSQL db named `infn_db`)

**Example** (creation of a new collection with data coming from an existing relational db):

```json
POST /v1/repos/infn/ HTTP/1.1
Content-Type: application/json

{
    "name": "old_articles",
    "import": "true",
    "location": "pubs",
    "coll_db": {
		"host": "somehost.ct.infn.it",
		"port": 3306,
		"username": "dbadmin",
		"password": "******",
		"database": "test_daily",
		"type": "mysql"
	}}
```

The previous request will create the collection `old_articles` import data from an existing database, named `test_daily` and providing access to its table named `pubs`.

### List all the collections of a repository

```http
GET /v1/repos/<repo_name>/ HTTP/1.1
```

This API will return a JSON array with all the collections of `<repo_name>`.
Each collection will have a `schema` attribute, describing the schema of the underlying DB table.
If the `schema` attribute is `null` it means it's a non-relational collection, schema-less (ex. MongoDB collection)

**Example**


```http
GET /v1/repos/sports HTTP/1.1
```

```json
[
	{
		"id": "560a60987ddaee89366556d2",
		"name": "football",
		"path": "/sports/football",
		"location": "football",
		"coll_db": null,
		"import": "false",
		"schema": null
	},
	{
		"id": "560a60987ddaee89366556d3",
		"name": "windsurf",
		"path": "/sports/windsurf",
		"location": "windsurf",
		"coll_db": null,
		"import": "false",
		"schema": {
			"rider": {
				"type": "string",
				"required": true
			},
			"nationality": {
				"type": "string",
				"required": false
			},
			"teamid": {
				"type": "number",
				"required": false
			}
		}
	}
]
```

The `sports` repository has two collections `football` and `windsurf`. The first one is stored on the default `coll_db` repository DB and it's schema-less, while the second one has a predefined `schema`.

### Retrieve the schema of a collection

```http
GET /v1/repos/<repo_name>/<collection_name>/_schema HTTP/1.1
```
If the given `collection_name` is hosted in a relation database table, this API will return a JSON object with the schema of the undelying table.

**Example**

```http
GET /v1/repos/comics/dylandog/_schema HTTP/1.1
```

```json
{
	"id": {
		"required": true,
		"length": null,
		"precision": 10,
		"scale": 0,
		"id": 1,
		"mysql": {
			"columnName": "id",
			"dataType": "int",
			"dataLength": null,
			"dataPrecision": 10,
			"dataScale": 0,
			"nullable": "N"
		}
	},
	"fragebogenId": {
		"required": true,
		"length": null,
		"precision": 10,
		"scale": 0,
		"mysql": {
			"columnName": "fragebogen_id",
			"dataType": "int",
			"dataLength": null,
			"dataPrecision": 10,
			"dataScale": 0,
			"nullable": "N"
		}
	},
	"nummer": {
		"required": true,
		"length": 256,
		"precision": null,
		"scale": null,
		"mysql": {
			"columnName": "nummer",
			"dataType": "varchar",
			"dataLength": 256,
			"dataPrecision": null,
			"dataScale": null,
			"nullable": "N"
		}
	}
}
```

### TODO: Delete a collection

```http
DELETE /v1/repos/<repo_name>/<collection_name>  HTTP/1.1
```

This API will delete the given `collection_name` from `repo_name`. Actual data on the backend table should not be deleted. It's a sort of _unlinking_, so that the db table/nosql collection will not be accessible anymore from the gLibrary REST API.



## Items (previously entries)

**Items** represents the content of a given collection. If a collection is hosted in a relational database, each item is a table record, while if it's non relational it's the document/object of the NoSQL collection.
Items can be listed and queried via the filtering system, created/added, updated and deleted, using the REST APIs provided by gLibrary.

### Item creation

```http
POST /v1/repos/<repo_name>/<collection_name>/ HTTP/1.1
```

This API add a new item into the given `collection_name`. Item content have to be provided as a JSON object. In case of the relational collection it should conform to the collection schema. In the case of attributes that have no corresponding column table, their values will be ignored silently. If the API will be successfull a new record or document will be added to the underlying table or NoSQL collection.

**Example**
```http
POST /v1/repos/infn/articles

{
	"title": "e-Infrastructures for Cultural Heritage Applications",
	"year": 2010,
	"authors": [ "A. Calanducci", "G. Foti", "R. Barbera" ]
}
```



### Item listing

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


### Item deletion

```http
DELETE  /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1
```

Cancella l'item indicato

```http
PUT /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1
```

### Item update

Modifica i metadati dell'item indicato

{da discutere} supporto multilingua ai metadati

```http
HEAD /v1/repos/<repo_name>/<collection_name>/<item_id>/i18n/<lang_code> HTTP/1.1
```

Restituisce i metadati nella lingua specificata

### Queries with filters



### Replicas

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

### Relations

{da discutere} Related items - next release

```http
GET /v1/repos/<repo_name>/<collection_name>/<item_id>/<related_collection_name> HTTP/1.1
```

Restituisce tutti gli item relativi all'idem\_id indicato nella
&lt;related\_collection\_name&gt;

