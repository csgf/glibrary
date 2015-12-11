gLibrary 2.0
============

Table of contents
-----------------

-  `Overview <#overview>`__
-  `Authentication <#authentication>`__

   -  `Login <#login>`__
   -  `User creation <#user-creation>`__

-  `Authorization <#authorization>`__

   -  `ACLs <#ACLs>`__

-  `Repositories <#repositories>`__

   -  `List
      repositories <#list-of-all-the-repositories-hosted-on-the-server>`__
   -  `Create a repository <#create-a-new-repository>`__

-  `Collections <#collections>`__

   -  `Create a collection <#create-a-new-collection>`__
   -  `Import a
      collection <#import-data-from-an-existing-relational-database>`__
   -  `List all the
      collections <#list-all-the-collections-of-a-repository>`__
   -  `Collection's schema <#retrieve-the-schema-of-a-collection>`__
   -  `Delete a collection <#delete-a-collection>`__

-  `Items <#items-previously-entries>`__

   -  `Creation <#item-creation>`__
   -  `Listing <#item-listing>`__
   -  `Detail <#item-detail>`__
   -  `Deletion <#item-deletion>`__
   -  `Update <#item-update>`__

-  `Replicas <#replicas>`__

   -  `Creation <#replica-creation>`__
   -  `List <#retrieve-all-the-replicas-of-the-given-item_id>`__
   -  `Download <#download-a-given-replica>`__
   -  `Upload <#upload-a-replica>`__
   -  `Delete <#delete-a-replica>`__

-  `Relations <#relations>`__

   -  `Retrieve related items <#retrieve-related-items>`__

-  `Contacts <#contacts>`__

Overview
--------

gLibrary is a service that offers both access to existing data
repositories and creation of new ones via a simple REST API.

A **repository** in the gLibrary lingo is a virtual container of one or
more data **collection**.

A **collection** provides access to a relational DB table or to a
non-relational (NoSQL) DB collection. Currenly gLibrary supports MySQL,
PostgreSQL, Oracle and MongoDB.

Each repository can group together one of more collections, providing a
virtual and uniform interface to data tables coming from different
databases that could be potentially of different types (for example one
collection provides access to a PostGreSQL table and another to a
MongoDB collection). JSON is used as the input and output data format.

Once collections are imported or created from scratch, the gLibrary
RESTA APIs can be used to retrieve, create, update and delete
collection's records, that in gLibrary lingo are called **items**.
Moreover a powerful filtering system is available to make queries on
collections. All the criteria are specified using the query string of
the API GET call. (ex
``/v2/repos/fantasy_company/orders?filter[where][userId]=acaland&filter[where][orderQuantity][gt]=200&filter[where][limit]=100``
will search for 100 orders issued by the user ``acaland`` with a
quantity of 100)

Each item can have one or more *attachment*, that we call **replica**.
Replicas can be stored on Grid Storage Elements (Disk Pool Manager) or
Cloud Storage (OpenStack Swift is supported).

**Relations** between two collections of the same repository can be
created, if foreign keys are properly assigned. Currently we support
one-to-many relations.

Beta server endpoint
~~~~~~~~~~~~~~~~~~~~

::

    http://glibrary.ct.infn.it:3500

Authentication
--------------

Before to send any request, users should be authenticated. Currenly
authentication is based on username/password couple. This will return a
**session token id** that needs to be used with any following request.
There are two options to send the **access\_token**:

-  via a query parameter:

::

        curl -X GET http://glibrary.ct.infn.it:3500/v2/repos?access_token=6Nb2ti5QEXIoDBS5FQGWIz4poRFiBCMMYJbYXSGHWuulOuy0GTEuGx2VCEVvbpBK

-  via HTTP headers:

::

    ACCESS_TOKEN=6Nb2ti5QEXIoDBS5FQGWIz4poRFiBCMMYJbYXSGHWuulOuy0GTEuGx2VCEVvbpBK

    curl -X GET -H "Authorization: $ACCESS_TOKEN" \
    http://glibrary.ct.infn.it:3500/v2/repos

Login
~~~~~

To obtain a session id, you need to pass a valid ``username`` and
``password`` to the following endpoint:

.. code:: http

    POST /v2/users/login HTTP/1.1

.. code:: json

    {
     "username":"admin",
     "password":"opensesame2015"
    }

Alternatively you can use the ``email`` addess instead of the
``username``.

User creation
~~~~~~~~~~~~~

New users are created issuing requests to the following endpoint:

.. code:: http

    POST /v2/repos/users HTTP/1.1

The mandatory parameters are:

-  **username**
-  **email**
-  **password**

Please notice that the created user, has no access to any repository
yet. The admin user need to assign the created user to any repository
and/or collections, setting properly the ACLs.

Authorization
-------------

Currently gLibrary allows to set separate permissions to repositories,
collections and items per each user. The default permission set to a
newly created user is *NO ACCESS* to anything. It's admin's
responsability to set properly the ACLs per each user. Currenly an
instance of gLibrary server has just one superadmin (the *admin* user),
but in future releases you will have the option to define admins per
repository.

ACLs
~~~~

To set ACLs, the super admin can issue requests to two separate
endpoints:

.. code:: http

    POST /v2/repos/<repo_name>/_acls http/1.1

and/or

.. code:: http

    POST /v2/repos/<repo_name>/<collection_name>/_acls http/1.1

The body of each requests has the following attributes:

+------------------------+------------------------------------------------------------------+
| attribute              | description                                                      |
+========================+==================================================================+
| *username*             | the username of the user to which we are adding permissions to   |
+------------------------+------------------------------------------------------------------+
| *permissions*          | valid options are "R" and "RW"                                   |
+------------------------+------------------------------------------------------------------+
| *items\_permissions*   | (for collections only) valid options are "R" and "RW"            |
+------------------------+------------------------------------------------------------------+

*permissions* refers to repository or collection permission, according
to where the request is issued:

-  Repository:

   -  "R" grants a user the capability of listing its content (ie. list
      of collections)
   -  "RW" grants a user the capability of creating (or importing) new
      collections or deleting them

-  Collection:

   -  "R" grants a user the capabilities to list the collection's
      content (list of items)
   -  "RW" grants a user the capabilities of creating, updating,
      deleting the collection's items

*items\_permissions* is valid only for collections's ACL and refers to:

-  "R" grants a user the capability to download items'replicas
-  "RW" grants a user the capality to create, update and upload replicas

Repositories
------------

A gLibrary server can host one or more **repositories**. A repository
should be created before creating new **collections** or importing
existing db tables or NoSQL collections as gLibrary collections.

A repository has a ``name``, a ``path``, that rapresents the access
point in the API path, and optionally a ``coll_db`` (*TODO*: rename as
``default_collection_db``). If a default DB is defined at the moment of
the creation, this will be the default backend DB for all the
collections created or imported of the given repository. However, this
can be ovverridden per each collection, if new DB info is provided when
the collection is created

List of all the repositories hosted on the server
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/ HTTP/1.1

Returns a list of all the repositories managed by the given gLibrary
server. Each repository has the following properties:

+------------------+--------------------------------------------------------------------------------------------+
| name             | description                                                                                |
+==================+============================================================================================+
| name             | Repository name                                                                            |
+------------------+--------------------------------------------------------------------------------------------+
| path             | Direct endpoint of the given repository                                                    |
+------------------+--------------------------------------------------------------------------------------------+
| collection\_db   | Default database where collection data should be stored. Can be overriden per collection   |
+------------------+--------------------------------------------------------------------------------------------+
| host             | FQDN of the default collection DB                                                          |
+------------------+--------------------------------------------------------------------------------------------+
| port             | port number of the default collection DB                                                   |
+------------------+--------------------------------------------------------------------------------------------+
| username         | username of the default collection DB                                                      |
+------------------+--------------------------------------------------------------------------------------------+
| password         | password of the default collection DB                                                      |
+------------------+--------------------------------------------------------------------------------------------+
| database         | name of the database to use for the default collection DB                                  |
+------------------+--------------------------------------------------------------------------------------------+
| type             | type of the default collection db (mysql, postgresql, mongodb)                             |
+------------------+--------------------------------------------------------------------------------------------+

Example:

.. code:: json

    {
        "name": "infn",
        "path": "http://glibrary.ct.infn.it:5000/v2/infn",
        "coll_db": {
            "host": "giular.trigrid.it",
            "port": 3306,
            "username": "root",
            "password": "*************",
            "database": "test",
            "type": "mysql"
        }
    }

Each repository can have a ``collection_db`` where collections data will
be stored. If no ``collection_db`` is specified, the repository will use
the local non-relational mongoDB that comes with gLibrary. Each
repository's collection can override the ``collection_db``.

Create a new repository
~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    POST /v2/repos/ HTTP/1.1

Create a new repository. A default ``collection_db`` can be specified.
It will store all the collections in case no ``collection\_db``
parameter is specified during collection creation. This property is
optional. If missing it will use the local MongoDB server.

**Parameters**

+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| name               | type     | description                                                                                           |
+====================+==========+=======================================================================================================+
| name               | string   | Name of the repository (will be the API path)                                                         |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| collection\_db     | object   | (Optional) Default database where collection data should be stored. Can be overriden per collection   |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| host               | string   | FQDN of the default collection DB                                                                     |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| port               | number   | port number of the default collection DB                                                              |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| username           | string   | username of the default collection DB                                                                 |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| password           | string   | password of the default collection DB                                                                 |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| database           | string   | name of the database to use for the default collection DB                                             |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| type               | string   | type of the default collection db (mysql, postgresql, mongodb)                                        |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| default\_storage   | object   | (Optional) specifies the default storage for replicas                                                 |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| baseURL            | string   | it's full path of Swift Container or Grid SURL for replica uploads                                    |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+
| type               | string   | "swift" or "grid" storage                                                                             |
+--------------------+----------+-------------------------------------------------------------------------------------------------------+

Note: ``name`` is a lowercase string. Numbers and underscores are
allowed. No oyjrt special characters are permitted

Example:

.. code:: json

    POST /v2/repos/ HTTP/1.1
    Content-Type: application/json

    {
        "name": "infn",
        "collection_db": {
            "host": "glibrary.ct.infn.it",
            "port": 5432,
            "username": "infn_admin",
            "password": "******",
            "database": "infn_db",
            "type": "postgresql"
        },
        "default_storage": {
            "baseURL": "http://stack-server-01.ct.infn.it:8080/v2/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore",
            "type": "swift"
        }
    }

Be sure to set ``Content-Type`` to ``application/json`` in the *Request
Headers*.

Collections
-----------

Each repository contains one or more collections. Collections are
abstractions over relational database tables or non-relational database
"collections", exposing their records over REST APIs and JSON format.
The available APIs allow the repository administrator to create new
collection, specifying a schema in the case of relational collection, or
importing existing tables/NoSQL collections. If not specified,
collections will be created/imported from the default ``coll_db``
(*TODO*: ``default_collection_db``) of the containing repository.
Otherwise, each collection can retrieve data from local or remote
database, overriding the defaul repository value, using the ``coll_db``
(*TODO*: ``collection_db``) property.

Create a new collection
~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    POST /v2/repos/<repo_name>/ HTTP/1.1

**Parameters**

+------------------+----------+-------------------------------------------------------------------------------------------------------+
| name             | type     | description                                                                                           |
+==================+==========+=======================================================================================================+
| name             | string   | Name of collection                                                                                    |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| schema           | object   | (Optional for non relational DB) define the schema of the new collection                              |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| collection\_db   | string   | (Optional) Default database where collection data should be stored. Can be overriden per collection   |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| host             | string   | FQDN of the default collection DB                                                                     |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| port             | number   | port number of the default collection DB                                                              |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| username         | string   | username of the default collection DB                                                                 |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| password         | string   | password of the default collection DB                                                                 |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| database         | string   | name of the database to use for the default collection DB                                             |
+------------------+----------+-------------------------------------------------------------------------------------------------------+
| type             | string   | type of the default collection db (mysql, postgresql, mongodb)                                        |
+------------------+----------+-------------------------------------------------------------------------------------------------------+

Schema is a JSON object listing the the name of the attributes and their
types in case we want a non-relational collection. Each property
represents the name of an attribute and the value is another object with
the following keys:

+------------+--------------------------------------------------------------------------------------------------+
| name       | description                                                                                      |
+============+==================================================================================================+
| type       | type of the attribute's value. Example of allowed types are: string, number, 'boolean', 'date'   |
+------------+--------------------------------------------------------------------------------------------------+
| required   | whether a value for the property is required                                                     |
+------------+--------------------------------------------------------------------------------------------------+
| default    | default value for the property                                                                   |
+------------+--------------------------------------------------------------------------------------------------+
| id         | whether the property is a unique identifier. Default is false                                    |
+------------+--------------------------------------------------------------------------------------------------+

For a full list of the supported type, please refer to
https://docs.strongloop.com/display/public/LB/LoopBack+types and
https://docs.strongloop.com/display/public/LB/Model+definition+JSON+file#ModeldefinitionJSONfile-Generalpropertyproperties.

**Example** (creation of a new collection on a relational db):

.. code:: json

    POST /v2/repos/infn/ HTTP/1.1
    Content-Type: application/json

    {
        "name": "articles",
        "schema": {
            "title": {"type": "string", "required": true},
            "year": "integer",
            "authors": "array"
        }
    }

The previous request will create a collection named ``articles`` into
the ``infn`` repository. The collection data will be stored into the
default ``coll_db`` specified for the ``infn`` repository (that
according to the previous example is a postgreSQL db named ``infn_db``)

Import data from an existing relational database
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you want to create a collection that maps an existing db table, two
additional properties are available:

+-------------+-------------------------------------------------------------+
| name        | description                                                 |
+=============+=============================================================+
| import      | it should set to ``true``                                   |
+-------------+-------------------------------------------------------------+
| tablename   | name of the database table of the database to be imported   |
+-------------+-------------------------------------------------------------+

**Example** (creation of a new collection with data coming from an
existing relational db):

.. code:: json

    POST /v2/repos/infn/ HTTP/1.1
    Content-Type: application/json

    {
        "name": "old_articles",
        "import": "true",
        "tablename": "pubs",
        "collection_db": {
            "host": "somehost.ct.infn.it",
            "port": 3306,
            "username": "dbadmin",
            "password": "******",
            "database": "test_daily",
            "type": "mysql"
        }}

The previous request will create the collection ``old_articles`` import
data from an existing database, named ``test_daily`` and providing
access to its table named ``pubs``.

List all the collections of a repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/ HTTP/1.1

This API will return a JSON array with all the collections of
``<repo_name>``. Each collection will have a ``schema`` attribute,
describing the schema of the underlying DB table. If the ``schema``
attribute is ``null`` it means the collection has been imported and it
inherits the schema of the underlying DB table. An additional API is
available to retrieve the schema of a given collection (see `next
API <#retrieve-the-schema-of-a-collection>`__).

**Example**

.. code:: http

    GET /v2/repos/sports HTTP/1.1

.. code:: json

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

The ``sports`` repository has two collections ``football`` and
``windsurf``. The first one is stored on the default ``coll_db``
repository DB and it's schema-less, while the second one has a
predefined ``schema``.

Retrieve the schema of a collection
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>/_schema HTTP/1.1

If the given ``collection_name`` is hosted in a relation database table,
this API will return a JSON object with the schema of the undelying
table.

**Example**

.. code:: http

    GET /v2/repos/comics/dylandog/_schema HTTP/1.1

.. code:: json

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

Delete a collection
~~~~~~~~~~~~~~~~~~~

.. code:: http

    DELETE /v2/repos/<repo_name>/<collection_name>  HTTP/1.1

This API will delete the given ``collection_name`` from ``repo_name``.
Actual data on the backend table should not be deleted. It's a sort of
*unlinking*, so that the db table/nosql collection will not be
accessible anymore from the gLibrary REST API.

Items (previously entries)
--------------------------

**Items** represents the content of a given collection. If a collection
is hosted in a relational database, each item is a table record, while
if it's non relational it's the document/object of the NoSQL collection.
Items can be listed and queried via the filtering system, created/added,
updated and deleted, using the REST APIs provided by gLibrary.

Item creation
~~~~~~~~~~~~~

.. code:: http

    POST /v2/repos/<repo_name>/<collection_name> HTTP/1.1

This API add a new item into the given ``collection_name``. Item content
have to be provided as a JSON object. In case of the relational
collection it should conform to the collection schema. In the case of
attributes that have no corresponding column table, their values will be
ignored silently. If the API will be successfull a new record or
document will be added to the underlying table or NoSQL collection.

**Example**

.. code:: http

    POST /v2/repos/infn/articles HTTP/1.1

    {
        "title": "e-Infrastructures for Cultural Heritage Applications",
        "year": 2010,
        "authors": [ "A. Calanducci", "G. Foti", "R. Barbera" ]
    }

Item listing
~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>/ HTTP/1.1

Retrieve the items inside the ``collection_name`` as a JSON array of
objects. Each object is a record of the underlying table (in case of
relational DB) or document (in case of NoSQL collection). By default the
first 50 items are returned. See below the description of filtering
system in the `query section <#queries-with-filters>`__ to change this
behaviour.

**Example**

.. code:: http

    GET /v2/repos/gridcore/tracciati    HTTP/1.1

Item detail
~~~~~~~~~~~

.. code:: json

    GET /v2/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Retrieve the detail of an item with a ``given_id``. It will return a
JSON object with the attributes mapping the schema of the given
``collection_name``.

**Example**

.. code:: json

    GET /v2/repos/infn/articles/22

Item deletion
~~~~~~~~~~~~~

.. code:: http

    DELETE  /v2/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Delete the given ``item_id`` of the the collection ``collection_name``.
Delete will be successfull only if the given item has no replica. You
can force the deletion of item with replicas setting:

.. code:: json

    {
        "force": true
    }

in the request body.

Item update
~~~~~~~~~~~

.. code:: http

    PUT /v2/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Update one of more attributes of the given ``item_id``. The request body
has to contain a JSON object with the attribute-value pair to be updated
with the new values.

Queries with filters
~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>?filter[<filterType>]=<spec>&filter[...]=<spec>... HTTP/1.1

where ``filterType`` is one of the following:

-  ``where``
-  ``include``
-  ``order``
-  ``limit``
-  ``skip``
-  ``fields``

and ``spec`` is the specification of the used filter.

Additional info on the full query syntax can be found
`here <https://docs.strongloop.com/display/public/LB/Querying+data#Queryingdata-RESTsyntax>`__

**Example**

Replicas
--------

Each item can have one or more attachments, generally the same file
stored in different locations, such as Cloud storage servers (Swift
based) or Grid Storage Elements (DPM based). So we call them also
replicas.

Replica creation
~~~~~~~~~~~~~~~~

.. code:: http

    POST /v2/repos/<repo_name>/<collection_name>/<item_id>/_replicas/ HTTP/1.1

+------------+---------------------------------------------------------------------------------+
| name       | description                                                                     |
+============+=================================================================================+
| uri        | (optional) provides the full storage path of where the replica will be saved    |
+------------+---------------------------------------------------------------------------------+
| type       | (optional) specifies the type of storage backend. Currently "swift" or "grid"   |
+------------+---------------------------------------------------------------------------------+
| filename   | The filename of the given replica                                               |
+------------+---------------------------------------------------------------------------------+

The first two parameters (``uri`` and ``type``) are optionals if a
``default_storage`` attribute has been set for the given repository. If
not, they need to be specified, otherwise the request to the API will
fail.

Please note that this API will just create a replica entry for the item,
but no actual file will be uploaded from the client. Once the replica
has been created you need to use the **Upload** API to transfer the
actual file payload.

Retrieve all the replicas of the given ``item_id``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>/<item_id>/_replicas/ HTTP/1.1

Download a given replica
~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>/<item_id>/_replicas/<rep_id> HTTP/1.1

Upload a replica
~~~~~~~~~~~~~~~~

Upload the file payload to the destinaton storage. This requires two
subsequent API request.

First, ask for the destination endpoint for the upload with:

.. code:: http

    PUT /v2/repos/<repo_name>/<collection_name>/<item_id>/_replicas/<rep_id> HTTP/1.1

This will return a **temporaryURL** valid a few seconds (example):

.. code:: json

    {
      "uploadURI": "http://stack-server-01.ct.infn.it:8080/v2/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/ananas.jpg?temp_url_sig=6cd7dbdc2f9e429a1b89689dc4e77f1d2aadbfc8&temp_url_expires=1449481594"
    }

Then use the URL returned by the previous API to upload the actual file,
using the PUT verb again (example):

.. code:: http

    PUT http://stack-server-01.ct.infn.it:8080/v2/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/ananas.jpg?temp_url_sig=6cd7dbdc2f9e429a1b89689dc4e77f1d2aadbfc8&temp_url_expires=1449481594 HTTP/1.1

It will return a 201 status code, if the upload will complete
successfully

Delete a replica
~~~~~~~~~~~~~~~~

.. code:: http

    DELETE /v2/repos/<repo_name>/<collection_name>/<item_id>/_replicas/<rep_id> HTTP/1.1

**Example**

Relations
---------

One to many relations can be created between collections of the same
repository, properly setting a foreign key.

To set the relation among two collections, issue the following request
to the collection in the "one" side of the one-to-many relation:

.. code:: http

    POST /v2/repos/<repo_name>/<collection_name>/_relation HTTP/1.1

The body of the request needs to provide two attributes:

+-----------------------+----------------------------------------------------------------------------------------+
| name                  | description                                                                            |
+=======================+========================================================================================+
| *relatedCollection*   | the "many" side of the one-to-many relation                                            |
+-----------------------+----------------------------------------------------------------------------------------+
| *fk*                  | the *foreign key* of *relatedCollection* that match the *id* of <*collection\_name*>   |
+-----------------------+----------------------------------------------------------------------------------------+

In practice, you should set the *fk* in such a way
``collection_name.id`` == ``relatedCollection.fk``

Retrieve related items
~~~~~~~~~~~~~~~~~~~~~~

.. code:: http

    GET /v2/repos/<repo_name>/<collection_name>/<item_id>/<related_collection>

Retrieve all the items from ``related_collection`` of the given
``item_id``.

Contacts
--------
