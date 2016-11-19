# gLibrary 2.0 tutorial

In this tutorial, we are going to use gLibrary APIs to create a demo repository, and collections, then populate those with new data, exposing data from existing databases, manage authentication and authorization.



## User creation and login

Before we can use any API we need to be authenticated. gLibrary provides API to create new users and to log in existing users.

Following the [docs](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#user-creation), we need to issue the following call:

```json
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
  	 "username": "demouser",
  	 "password": "Demo1234",
  	 "email": "demouser@ct.infn.it"
	  }' \
  https://glibrary.ct.infn.it:3500/v2/users
```

If the user is created successfully you should get back the details of the user and its `id`:

```json
{
	"username": "demouser",
	"email": "demouser@ct.infn.it",
	"id": "577a1da1a9f1344a0406802e"
}
```

Now that we have a user, we need to sign in, using the [login](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#login) API, to retrieve a `session token`to be user in all the following requests:

```json
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "username": "demouser",
        "password": "Demo1234"
      }' \
  https://glibrary.ct.infn.it:3500/v2/users/login
```

The results will contain the token in the `id` field:

```json
{
    "created": "2016-07-04T08:40:03.905Z",
    "email": "demouser@ct.infn.it",
    "id": "EhHOLKgFR7xjwTIHszJ8fnJMz1CWsks5h5q3QK0Y9nBjKkfPzCdElAYziaSROJsP",
    "ttl": 1209600,
    "userId": "577a1da1a9f1344a0406802e",
    "username": "demouser"
}
```

All the following requests should pass the retrieved token, in the `Authorization` header. For the purpose of the tutorial, we will save the token in a environment variable:

```
export TOKEN=EhHOLKgFR7xjwTIHszJ8fnJMz1CWsks5h5q3QK0Y9nBjKkfPzCdElAYziaSROJsP
```

and we will pass to curl the following header:

```json
-H "Authorization: $TOKEN"
```


### (Tip) Pretty printing JSON output from curl

If you want to have the JSON results from the APIs in a pretty format, you can pipe your curl requests with `python -m json.tool`, if you have python installed in your system.
Eg:

```json
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
        "username": "demouser",
        "password": "Demo1234"
      }' \
  https://glibrary.ct.infn.it:3500/v2/users/login | python -m json.tool
```

In alternative, you can use `jsontool` (it's a node package that you can install with `npm install -g jsontool`). If you want even a better output, you can install `pygments` if you want a colourized output (`pygments` is Python package that you can install with `pip install pygments` or `easy_install pygments`)


## List the available repositories

To list the repositories hosted on the server, we can use the `/v2/repos` endpoint:

```
curl -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/
```

Unfortunately you will get an error:

```json
{
  "error": {
    "name": "Error",
    "status": 401,
    "message": "Authorization Required",
    "statusCode": 401,
    "code": "AUTHORIZATION_REQUIRED"
  }
}
```

because the default ACL on the `/v2/repos` endpoint in the default configuration, allows only the admin users to list it's content. If you have a admin token, you should get something like that:

```json
[
  {
    "name": "gridcore",
    "path": "/v2/repos/gridcore",
    "collection_db": null,
    "default_storage": null
  },
  {
    "name": "box",
    "path": "/v2/repos/box",
    "collection_db": null,
    "default_storage": null
  },
  {
    "name": "funny",
    "path": "/v2/repos/funny",
    "collection_db": null,
    "default_storage": null
  },
  {
    "name": "lezioni",
    "path": "/v2/repos/lezioni",
    "collection_db": null,
    "default_storage": null
  },
  ...
]
```

If you want to use our server located at `glibrary.ct.infn.it`, you generally need to **contact** the glibrary service admin and request for a **new repository** associated to your own account. You will become the **admin** of this repository. Currently you need to send an email to `sg-licence@ct.infn.it` with your gLibrary *username* and the name of the `repository` you want to be created (only lowercase chars are allowed, numbers and the underscore char). You should provide also some information on the project you need to work on and if you belong to some organization in a way to assign you proper storage resources.


## (gLibrary server admin) Repository creation

So let's suppose you send an email to `sg-license@ct.infn.it` with the request to create a `demo2016` repository for your project. Here the necessary steps the glibrary server admin have to do. This instructions are also valid in the case you are installing your own instance of gLibrary on your server.
As documented [here](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#create-a-new-repository), there are several options to create a new repository. The simplest one is to just pass in the name of the repository:

```http
curl  -X POST \
  -H "Authorization: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  		  "name": "demo2016"
  	  }' \
  https://glibrary.ct.infn.it:3500/v2/repos
```

The results will look like this:

```json
{
	"name": "demo2016",
	"path": "/demo2016",
	"tablename": "demo2016",
	"collection_db": null,
	"default_storage": null,
	"id": "577a28faa9f1344a0406802f"
}
```

Our new repository *resourse* and all its APIs will be available at

```
https://glibrary.ct.infn.it:3500/v2/repos/demo2016
```

We haven't set a `default_storage` for the replicas, nor a default `collection_db` for all the collections of our repository. If we start creating collections, by default, all new collections will be created into the default *MongoDB* database that uses gLibrary for its configuration.
Even if you don't set the defaults here, you will be able to customize the `collection_db`per each of the repository's collections. We will do that in the next steps.

## (glibrary server admin) Set Up an ACL for a repository

We have now a repository but our `demouser ` user won't be able to use it. The Admin needs to assign the right ACLs to the repository.

Following the [documentation](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#acls) the admin need to the `demouser` user to the `demo2016` repository:

```json
curl -X POST \
  -H "Authorization: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
          "username": "demouser",
          "permissions": "RW"
      }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/_acls | json
```

If you receive something like this:

```json
{
  "message": "ACL has been added"
}
```
your user should be now ready to work on its repository by himself/herself.

## List collections of a repository

Now that we have an user account `demouser` and we got assigned a brand new repository `demo2016` it's time to play with it. Probably the first operation that we would like to do is to list it's content, i.e. collections belonging to the repository. By the way, we have just created the repository, so we should get back an empty response. But this is the occasion if the authorization system (ACLs) are set up correctly for our account/repository:

```json
curl -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/
```

As expected the request will return:

```
[]
```

## Create collections

gLibrary offers several options to create collections:

* create **schema less** collections (backed up on the local MongoDB database on a remote MongoDB database)
* create collection with a **fixed schema** on a local or remote MySQL/PostgreSQL database
* create a local or remote collections **from data coming from an existing local or remote database** of type PostgreSQL, MongoDB or PostgreSQL

Let's try each of the previous options.

### Create a schema less collection

The easier option, if you don't have already existing data is to create a schema less collection (i.e. based on NoSQL DB, such as MongoDB). For the purpose of this example we are going to use the local MongoDB database that is installed beside each gLibrary installation. The advantace of this approach is that you don't need to have any credentials to configure the connection to the db, besides the advantage of a schema less approch, where you don't need to define in advance the structure of your datasets.

According the [documentation](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#create-a-new-collection) we need to issue the following request:

```json
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "movies"
      }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016
```

if we get back:

```json
{"message":"The collection was successfully created "}
```

it's a good sign :)

if you now issue a list request to the `demo2016` repository:

```json
curl  -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/
```

gLibrary returns:

```json
[
  {
    "name": "movies",
    "path": "/v2/repos/demo2016/movies",
    "tablename": "movies"
  }
]
```

So we have created a new `movies` collection and we are ready to add **items** on it.

#### Populating a collection with new items

It's time to create our first record, or in the gLibrary lingo, our first **item**. It's simple a matter of posting a JSON doc to the right collection endpoint. Our new `/v2/repos/demo2016/movies` resource is a compliant REST endpoint where we can issue the classing CRUD operation with the GET/POST/PUT/DELETE verb to retrieve/create/edit/delete items.

Let's create a new item with a POST request:

```json
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-type: application/json" \
  -d '{
  		"title": "Anger Management",
  		"year": 2013,
  		"cast": [
  			 "Jack Nicholson",
  			 "Adam Sandler",
  			 "Marisa Tomei"
  		],
  		"genre": "comedy",
  		"release_date": "2013-06-13"
  	  }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/movies | json
```

(Should be FIXED!)> Currently our ACL system doesn't inherit permissions. So our `/v2/repos/demo2016/movies` endopoint has no ACL and only the admin user can access. So the previous requests will fail. We are working to fix this ASAP. Meanwhile you need to explicitly set an ACL to the `movies`collection for full permission:
>
> ```curl -X POST \
>   -H "Authorization: $ADMIN_TOKEN"
>   -H "Content-type: application/json"
>   -d '{
> 			"username": "demouser",
> 			"permissions": "RW",
> 			"items_permissions": "RW"
> 		}'
>   https://glibrary.ct.infn.it:3500/v2/repos/demo2016/movies/_acls
> ```

Here the result:

```json
{
  "id": "577a3dbea9f1344a04068048",
  "title": "Anger Management",
  "year": 2013,
  "cast": [
    "Jack Nicholson",
    "Adam Sandler",
    "Marisa Tomei"
  ],
  "genre": "comedy",
  "release_date": "2013-06-13"
}
```

#### Retrieve item details

You can retrieve the **item** using the assigned `id`:

```json
curl -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/movies/577a3dbea9f1344a04068048 | json
```

#### Delete an item

```json
curl -X DELETE \
  -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/movies/577a3dbea9f1344a04068048 | json
```

#### Edit an item

```json
curl -X PUT \
  -H "Authorization: $TOKEN" \
  -H "Content-type: application/json" \
  -d '{
  		"country": "USA"
  	  }' \
 https://glibrary.ct.infn.it:3500/v2/repos/demo2016/movies/577a3dbea9f1344a04068048 | json
```

### Create a collection with a fixed schema on a remote database

```json
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-type: application/json" \
  -d '{
  		"name": "actors",
  		"schema": {
  			"name": "string",
  			"date_of_birth": "date",
  			"movies": "array"
  		},
  		"collection_db": {
  			"host": "giular.trigrid.it",
  			"type": "mysql",
  			"database": "demo",
  			"username": "glibrary_server",
  			"password": "Pippo1234",
  			"port": 3306
  		}
     }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/
```

#### Add an entry to fixed schema collection

(Should be FIXED!)> Again, at the moment, you need to add ACL to the `actors` collection with:

>```json
curl -X POST \
  -H "Authorization: $ADMIN_TOKEN" \
  -H "Content-type: application/json" \
  -d '{
          "username": "demouser",
          "permissions": "RW",
          "items_permissions": "RW"
      }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/actors/_acls
```

```json
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-type: application/json" \
  -d '{
			"name": "Adam Sandler",
  			"date_of_birth": "1966-09-09",
  			"movies": [
	  				"Mr. Deeds",
	  				"Spanglish",
	  				"Anger Management"
  				]
  			}' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/actors | json
```


#### Delete a collection

```json
curl -X DELETE \
 -H "Authorization: $TOKEN" \
 https://glibrary.ct.infn.it:3500/v2/repos/demo2016/actors2
```


### Create a collection with existing data

The third option is to create a collection with data coming from an already existing database. This database can be local (to glibrary server) or remote database.

For this exercise, we are going to use a sample database from [MySQL tutorial](http://www.mysqltutorial.org/mysql-sample-database.aspx). It's a database of a retailer of scale models of classic cars.

Let's create a collection that give access to the `products` table.

```json
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-type: application/json" \
  -d '{
        "name": "products",
        "import": "true",
        "tablename": "products",
        "collection_db": {
            "host": "giular.trigrid.it",
            "type": "mysql",
            "database": "classicmodels",
            "username": "glibrary_server",
            "password": "Pippo1234",
            "port": 3306
        }
     }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/
```
Other than the settings we have already seen, two new properties are needed, as documented [here](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#import-data-from-an-existing-relational-database):

* *import*: set to true
* *tablename*: the db table from where data should come from

(Should be FIXED!)> We need to add an ACL again this new table
>
> ```json
> curl -X POST \
  -H "Authorization: $ADMIN_TOKEN" \
  -H "Content-type: application/json" \
  -d '{
          "username": "demouser",
          "permissions": "RW",
          "items_permissions": "RW"
      }' \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products/_acls
```
Now we can access the items from the `products` collection:

```json
curl -H "Authorization: $TOKEN" \
 https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products | json
```
If you need to get access for a specific item, just use the primary key (in this case the `productcode` of an item):

```json
curl -H "Authorization: $TOKEN" \
 https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products/S72_3212 | json
```

## Making queries

gLibrary provides a powerful way of doing queries through its REST APIs.
It follows some examples:

* Retrieve the first 3 items from a collection:

```json
curl -g -H "Authorization: $TOKEN" \
 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[limit]=3' | json
```

* Retrieve the 11th item of the collection:

```json
curl -g -H "Authorization: $TOKEN" \
 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[limit]=1&filter[skip]=10' | json
```

* Order items by `quantityinstock`:

```json
curl -g -H "Authorization: $TOKEN" \
 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[order]=quantityinstock%20ASC' | json
```

* Items that satisfy a given condition

	- Price is greater than 90 dollars

	```json
	curl -g -H "Authorization: $TOKEN" \
	 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[where][buyPrice][gt]=90' | json
	```

	- Price is between 50 and 60 dollars

	```json
	curl -g -H "Authorization: $TOKEN" \
	 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[where][buyPrice][between][0]=50&filter[where][buyPrice][between][1]=60' | json
	```

	- Price is greated than 50 and there is more than 8000 items in stock:

	```js
	curl -g -H "Authorization: $TOKEN" \
	 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[where][and][0][buyPrice][gt]=50&filter[where][and][1][quantityinstock][gt]=8000' | json
	```

	- Vendor is *Min Lin Diecast*

	```js
	curl -g -H "Authorization: $TOKEN" \
	 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[where][productVendor]=Min%20Lin%20Diecast' | json
	```

	- is a *Mercedes*

	```js
	curl -g -H "Authorization: $TOKEN" \
	 'https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products?filter[where][productName][like]=%Mercedes%&include_count=true' | json
	```

## Replicas

### Creation of a replica (or attachment)

Docs are [Here](http://csgf.readthedocs.io/en/latest/glibrary/docs/glibrary2.html#replica-creation)

We want to add an image file to some of the cars of our datasets. For example we want to add an image to the record with `id: "S18_1367"`:

Replica creation is done in three steps:

1) Creation of the replica:

```js
curl -X POST \
  -H "Authorization: $TOKEN" \
  -d '{
  		 "uri": "http://cloud.recas.ba.infn.it:8080/v1/AUTH_b99dd86274a44e0e996944b72dd2d846/glibrary/demo2016/mercedes.jpg",
  		 "type": "swift",
  		 "filename": "mercedes.jpg"
  	  }' \
 https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products/S18_1367/_replicas | json
```

In this example the user knows where the file should be uploaded. Generally the admin should set up the `default_storage` properties so that user should just fill the `filename`

This should return:

```json
{
  "filename": "mercedes.jpg",
  "type": "swift",
  "repository": "demo2016",
  "collection": "products",
  "itemId": "S18_1367",
  "id": "577a7f6776666c1d167bd392",
  "uri": "http://cloud.recas.ba.infn.it:8080/v1/AUTH_b99dd86274a44e0e996944b72dd2d846/glibrary/demo2016/mercedes.jpg",
  "name": "replica"
}
```


2) Creation of the temp URL where we should actually trasfer the actual file:

```js
curl -X PUT \
  -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products/S18_1367/_replicas/577a7f6776666c1d167bd392  | json
```

3) The user has now 30 seconds to complete the upload to the return URL:

```js
curl -X PUT -T mercedes.jpg \
  'http://cloud.recas.ba.infn.it:8080/v1/AUTH_b99dd86274a44e0e996944b72dd2d846/glibrary/demo2016/mercedes.jpg?temp_url_sig=53524afa125f90f13e9528e70c8c6ec089f4b93f&temp_url_expires=1467646397'
```

**Please notice the trasfer of data is direct to the destination storage without caching data on the glibrary server**

### Download a replica

```js
curl -H "Authorization: $TOKEN" \
  https://glibrary.ct.infn.it:3500/v2/repos/demo2016/products/S18_1367/_replicas/577a7f6776666c1d167bd392&no_redirect=true
```

This will return another temporary URL:

```
Moved Temporarily. Redirecting to
http://cloud.recas.ba.infn.it:8080/v1/AUTH_b99dd86274a44e0e996944b72dd2d846/glibrary/demo2016/mercedes.jpg?temp_url_sig=2659ccad78560a8c5b12f06872f5b63d17a2c2f0&temp_url_expires=1467646825
```

from where you can download the actual JPG file.
