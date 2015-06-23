************
GLIBRARY 2.0 
************

REST API v2.0 (Draft)
*********************


Repositories
============ 


List of all the repositories hosted on the server
________________________________________________

.. code-block:: http

	GET	/v1/repos/ HTTP/1.1



Create a new repository
_______________________


.. code-block:: http

	POST /v1/repos/ HTTP/1.1

**Parameters**

===========		==========	===============================================================================================================
name 			type 		description
===========		==========	===============================================================================================================
name 			string 		Short name of the repository (will be the API path)
description		string 		Descriptive text of the repo
location 		string 		``local`` or ``remote`` (default: ``local``)
type 			string 		``mysql``, ``postgresql``, ``mongodb``, ``sqlserver``, ``oracle`` (default: ``mongodb``)
host 			string 		hostname or ipaddress of the DB server (default: ``localhost``)
port			number 		port number of the DB server (default: ``27017``)
dbname			string		name of the database that contains/will contain the repository's collections (can be overriden per collection)
thumbnail 		url 		local or remote url of an image to be used as thumbnail
id      		number 		unique identifier of the repo
ownerId  		number		id of the repository creator
===========		==========	===============================================================================================================



Crea un nuovo repository

.. code-block:: http

	HEAD /v1/repos/<repo_name> HTTP/1.1

Mostra le info di configurazione (metadati) del repository <repo_name>

.. code-block:: http

	DELETE /v1/repos/<repo_name> HTTP/1.1

Cancella il repository <repo_name>

.. code-block:: http

	PUT /v1/repos/<repo_name> HTTP/1.1

Modifica le info di configurazione (metadati) del depository <repo_name>

Collections
===========

.. code-block:: http

	POST /v1/repos/<repo_name>/ HTTP/1.1

Crea una nuova collection o importa una tabella di un db esistente come collection nel repository <repo_name>. Il nome della collections viene passato come parametro nel body

.. code-block:: http

	GET /v1/repos/<repo_name>/ HTTP/1.1

Elenco di tutte le collection del repository <repo_name>

.. code-block:: http

	HEAD /v1/repos/<repo_name>/<collection_name> HTTP/1.1

Restituisce i metadati della collection <collection_name> del repository <repo_name>

.. code-block:: http
	
	DELETE /v1/repos/<repo_name>/<collection_name> HTTP/1.1

Cancella la collection <collection_name>

.. code-block:: http

	PUT /v1/repos/<repo_name>/<collection_name> HTTP/1.1

Modifica i metadati della <collection_name>

Items (previously entries)
==========================

.. code-block:: http

	POST /v1/repos/<repo_name>/<collection_name>/ HTTP/1.1

Crea un nuovo item nella collection <collection_name> con tutti i suoi metadati

.. code-block:: http

	GET /v1/repos/<repo_name>/<collection_name>/ HTTP/1.1

Elenco di tutti gli item contenuti nella collection <collection_name>

.. code-block:: http

	HEAD /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Restituisce i metadati dell'item con id <item_id>, incluse le sue eventuali repliche

.. code-block:: http

	DELETE  /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Cancella l'item indicato

.. code-block:: http

	PUT /v1/repos/<repo_name>/<collection_name>/<item_id> HTTP/1.1

Modifica i metadati dell'item indicato

{da discutere} supporto multilingua ai metadati

.. code-block:: http

	HEAD /v1/repos/<repo_name>/<collection_name>/<item_id>/i18n/<lang_code> HTTP/1.1

Restituisce i metadati nella lingua specificata

{da discutere} Related items - next release

.. code-block:: http

	GET /v1/repos/<repo_name>/<collection_name>/<item_id>/<related_collection_name> HTTP/1.1

Restituisce tutti gli item relativi all'idem_id indicato nella <related_collection_name>


Replicas
========

.. code-block:: http

	POST /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/ HTTP/1.1

Crea una replica per l'item_id indicato. Restituisce la URL dello storage su cui effettuare un direct upload con operazione di POST o PUT entro pochi secondi

.. code-block:: http

	GET /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/<rep_id> HTTP/1.1

Restituisce la URL dello storage da cui effettuare un direct download della replica indicata del item con <item_id>
