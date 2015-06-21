

####################################
gLibrary 1.0 documentation
####################################

REST API v 1.0
**************

gLibrary provides two endopoints depending on the type of operation:

* **Data Management** (DM):		operations that affect the underlying storage backend (Grid DPM servers or Swift Object Storage)
* **Metadata Management** (MM):	operations that affect the underlying Metadata and DB Services (AMGA and PostgreSQL currently)

DM endpoint::

	https://glibrary.ct.infn.it/dm/

MM endpoint::

	https://glibrary.ct.infn.it:4000/

Internally they have been deployed as two separate services, using two different technology, respectively, Flask, a Python microframework, and Node.js. 


Authentication
==============

At the moment, APIs can be accessed directly with a X.509 certificates from any HTTPs client (eg: command line scripts with _curl_ or _wget_, Web or Desktop HTTP clients) or indirectly through a Science Gateway. 

For **X.509 authentication**, currently INFN released Robot certificated are allowed, and a given set of users that requested access. If you need to have access to our APIs with a personal X.509 certificate, please contact us at sg-license@ct.infn.it.

To access gLibrary API from web applications or Science Gateway portels, we have implemented **server-to-server authentication**. We mantein a white list of server IP addresses that are allowed to access glibrary endpoints. To avoid CORS problems, your server should implement a proxy mechanism that blindly redirect API requests to our endpoints. Again, contact us at sg-license@ct.infn.it, to request access for your server.

Data Management
===============

File Download
_____________

Download a file from a Storage Element to the local machine

.. code-block:: http
	
	GET https://glibrary.ct.infn.it/dm/<vo>/<se>/<path:path>


**Parameters**


=========	===========================================
Parameter	Description
=========	===========================================
vo			Virtual Organisation (eg: vo.aginfra.eu)
se			Storage Element (eg: prod-se-03.ct.infn.it)
path		absolute path of the file to be downloaded
=========	===========================================

**Response**


Short lived URL to download the file over http.
Example::

	curl -L -O https://glibrary.ct.infn.it/dm/vo.aginfra.eu/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.dch-rp.eu/test/IMG_0027.PNG


File Upload
___________

Upload a local file to a given Storage Element of a Virtual Organization. The upload of a file requires two steps: the first one prepares the destination storage to receive the upload and returns a short-lived URL to be used by a second API request for the actual upload (second step).


.. code-block:: http

	GET https://glibrary.ct.infn.it/dm/put/<vo>/<filename>/<se>/<path:path>
	
	PUT http://<storage_host>/<storage_path>


**Parameters**

=========	==============================================================================================
Parameter	Description
=========	==============================================================================================
vo			Virtual Organisation (vo.aginfra.eu)
se			Storage Element where upload the file (eg: prod-se-03.ct.infn.it)
filename	Name that will be used to store the file on the storage. Can be different by the original name
path		Absolute path where the file will be located on the storage
=========	==============================================================================================

**Response**

Redirect short-live URL, authorized only for the requesting IP, where the actual file should be uploaded
Status	307 (temporary redirect)

Example:

step-1::	

	curl http://glibrary.ct.infn.it/dm/put/vo.aginfra.eu/file-test.txt/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.dch-rp.eu/test/


Output:


.. code-block:: json

	{
 		"redirect": "http://prod-se-03.ct.infn.it/storage/vo.aginfra.eu/2014-04-30/file-test.txt.53441.0?sfn=%2Fdpm%2Fct.infn.it%2Fhome%2Fvo.aginfra.eu%2Ftest%2F%2Ffile-test.txt&dpmtoken=48042a60-005c-4bf1-9eea-58b6a971eb52&token=GgxCE%2FmbfYJv09H0QRFrSInghK0%3D%401398870909%401", 
 		"status": 307
	}

Example 

step-2::	

	curl -T file-test.txt -X PUT "http://prod-se-03.ct.infn.it/storage/vo.aginfra.eu/2014-04-30/file-test.txt.53441.0?sfn=%2Fdpm%2Fct.infn.it%2Fhome%2Fvo.aginfra.eu%2Ftest%2F%2Frfile-test.txt&dpmtoken=48042a60-005c-4bf1-9eea-58b6a971eb52&token=GgxCE%2FmbfYJv09H0QRFrSInghK0%3D%401398870909%401"


.. code-block:: html	
	
	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>201 Created</title>
	</head><body>
	<h1>Created</h1>
	<p>Resource /storage/vo.aginfra.eu/2014-04-30/file-test.txt.53441.0 has been created.</p>
	<hr />
	<address>Apache/2.2.15 (Scientific Linux) Server at prod-se-03.ct.infn.it Port 80</address>
	</body></html>


File Download (Swift Object Storage)
____________________________________

::

	GET https://glibrary.ct.infn.it/api/dm/cloud/<host>/<path>

**Parameters**

============	=====================================================================================
Parameter 		Description
============	=====================================================================================
``host`` 		Swift Object-storage front-end (or proxy)
``path`` 		Object full path, following the Swift format: ``/v1/<account>/<container>/<object>``
============	=====================================================================================

Example::

	curl  https://glibrary.ct.infn.it/api/dm/cloud/stack-server-01.ct.infn.it/v1/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/ananas.jpg

Returns::

	{
		url: "http://stack-server-01.ct.infn.it:8080/v1/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/ananas.jpg?temp_url_sig=c127c8c2bda34e4ca45afabe42ed606200daab6b&temp_url_expires=1426760853”
	}
	
The returned URL, that allows the direct download of the requested file from the containing server, has an expiration of 10 seconds.


File Upload (Swift Object Storage)
____________________________________

::

	PUT https://glibrary.ct.infn.it/api/dm/cloud/<host>/<path>

**Parameters**

============	=====================================================================================
Parameter 		Description
============	=====================================================================================
``host`` 		Swift Object-storage front-end (or proxy)
``path`` 		Object full path, following the Swift format: ``/v1/<account>/<container>/<object>``
============	=====================================================================================

Example::

	curl -X PUT https://glibrary.ct.infn.it/api/dm/cloud/stack-server-01.ct.infn.it/v1/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/tracciati/prova.xml

Returns::

	{
		url: "http://stack-server-01.ct.infn.it:8080/v1/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/tracciati/prova.xml?temp_url_sig=8083f489945585db345b7c0ad015290f8a86b4a0&temp_url_expires=1426761014"
	}

Again it returns a temporary URL valid 10 seconds to complete the upload directly to the storage with::

	curl -X PUT -T prova.xml  "http://stack-server-01.ct.infn.it:8080/v1/AUTH_51b2f4e508144fa5b0c28f02b1618bfd/gridcore/tracciati/prova.xml?temp_url_sig=8083f489945585db345b7c0ad015290f8a86b4a0&temp_url_expires=1426761014



File system namespace management
================================

These APIs expose a subset of WebDAV functionalities over eInfrastructure Storage Elements. They allow operations such as directory creation (``MKCOL``), file metadata retrieval (``PROPFIND``), file renaming (``MOVE``), file deleting (``DELETE``).


::

	PROPFIND	https://glibrary.ct.infn.it/dm/dav/<vo>/<se>/<path:path>
	DELETE 	 	https://glibrary.ct.infn.it/dm/dav/<vo>/<se>/<path:path>
	MOVE		https://glibrary.ct.infn.it/dm/dav/<vo>/<se>/<path:path>
	MKCOL		https://glibrary.ct.infn.it/dm/dav/<vo>/<se>/<path:path>

**Parameters**

=========	=====================================================================
Parameter	Description
=========	=====================================================================
``vo``		Virtual Organisation (vo.aginfra.eu)
``se``		Storage Element where the file is located (eg: prod-se-03.ct.infn.it)
``path``	Absolute path where the file is located on the storage
=========	=====================================================================

Directory Creation
__________________

Example::

	curl -X MKCOL http://glibrary.ct.infn.it/dm/dav/vo.aginfra.eu/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.aginfra.eu/test2/

Output:

.. code-block:: html

	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>201 Created</title>
	</head><body>
	<h1>Created</h1>
	<p>Collection /dpm/ct.infn.it/home/vo.aginfra.eu/test2/ has been created.</p>
	<hr />
	<address>Apache/2.2.15 (Scientific Linux) Server at prod-se-03.ct.infn.it Port 443</address>
	</body></html>

 
File metadata retrieval
_______________________

Example::	

	curl -X PROPFIND -H "Depth:1" http://glibrary.ct.infn.it/dm/dav/vo.aginfra.eu/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.aginfra.eu/test2/

Output	

.. code-block:: xml

	<?xml version="1.0" encoding="utf-8"?>
	<D:multistatus xmlns:D="DAV:">
	<D:response xmlns:lcgdm="LCGDM:" xmlns:lp3="LCGDM:" xmlns:lp1="DAV:" xmlns:lp2="http://apache.org/dav/props/">
	<D:href>/dm/dav/vo.ag-infra.eu/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.aginfra.eu/test2/</D:href>
	<D:propstat>
	<D:prop>
	<lcgdm:type>0</lcgdm:type><lp1:resourcetype><D:collection/></lp1:resourcetype>
	<lp1:creationdate>2014-04-30T15:25:31Z</lp1:creationdate><lp1:getlastmodified>Wed, 30 Apr 2014 15:25:31 GMT</	lp1:getlastmodified><lp3:lastaccessed>Wed, 30 Apr 2014 15:25:31 GMT</lp3:lastaccessed><lp1:getetag>ca36-536115eb<	/lp1:getetag><lp1:getcontentlength>0</lp1:getcontentlength><lp1:displayname>test2</lp1:displayname><	lp1:iscollection>1</lp1:iscollection><lp3:guid></lp3:guid><lp3:mode>040755</lp3:mode><lp3:sumtype></lp3:sumtype><	lp3:sumvalue></lp3:sumvalue><lp3:fileid>51766</lp3:fileid><lp3:status>-</lp3:status><lp3:xattr>{"type": 0}</	lp3:xattr><lp1:owner>5</lp1:owner><lp1:group>102</lp1:group></D:prop>
	<D:status>HTTP/1.1 200 OK</D:status>
	</D:propstat>
	</D:response>
	</D:multistatus>


File deletion
_____________

::

	curl -X DELETE http://glibrary.ct.infn.it/dm/dav/vo.dch-rp.eu/prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.aginfra.eu/test/file-test.txt

 
Repository Management
=====================

List of the available repositories
__________________________________


Returns the list of the available repositories

.. code-block:: http

	GET https://glibrary.ct.infn.it:3000/repositories

Example:

	https://glibrary.ct.infn.it:3000/repositories

Output:

.. code-block:: json

	{
 		"result": [
 		  "/gLibTest",
 		  "/deroberto",
 		  "/gLibIndex",
 		  "/tmp",
 		  "/deroberto2",
 		  "/medrepo",
 		  "/ESArep",
 		  "/EELA",
 		  "/EGEE",
 		  "/testRepo",
 		  "/ChinaRep",
 		  "/templaterepo",
 		  "/myTestRepo",
 		  "/ICCU",
 		  "/aginfra",
 		  …
 		]
	}

 
Repository Creation
___________________


Description	Create a new repository

.. code-block:: http

	POST https://glibrary.ct.infn.it:3000/repositories/<repo>

Returns:

.. code-block:: json
	
	{
		'success': "true"
	}
               

**Parameters**

=========	===============
Parameter	Description
=========	===============
repo		Repository name
=========	===============

Example::

	curl –X POST http://glibrary.ct.infn.it:3000/repositories/agInfra


 
Retrieve repository information
_______________________________

Provides the list of types (model) of a given repository. A type describes the kind of digital objects using a schema (set of attributes).


.. code-block:: http

	GET https://glibrary.ct.infn.it:3000/repositories/<repo>

Returns	an array of all the types available in the given repository. Each object rapresents a supported type, with some properties:

**Parameters**

=========	===============
Parameter	Description
=========	===============
repo		Repository name
=========	===============

**Response**

================	================================================================================================================
Property			Description
================	================================================================================================================
``TypeName``		a label that describes the type (to be shown in the gLibrary browser Interface)
``Path``	 		the absolute path of the entries in the underlying metadata server (AMGA)
``VisibleAttrs``	the set of attributes visible through the gLibrary browser (both Web and mobile)
``FilterAttrs``	 	a set of attributes that can be used to filter the entries (digital objects) of the given type
``ColumnWidth``	 	size of each column (attribute) in the gLibrary browser
``ParentID``	 	types can be organized in a hierarchical structure (tree), and a type can have a subtype. The root type has id 0
``Type``	 		a unique identifier assigned to a given type to refer to it in other API call	
================	================================================================================================================


Example::

	curl http://glibrary.ct.infn.it:3000/repositories/agInfra

Output

.. code-block:: json

	{
		"results": [
		  {
		    "TypeName": "Soil Maps",
		    "Path": "/agInfra/Entries/SoilMaps",
		    "VisibleAttrs": "Thumb title creator subject description type format language date",
		    "FilterAttrs": "creator subject publisher contributor type format language rights",
		    "ColumnWidth": "80 120 60 60 230 100 100 80 80",
		    "ParentID": "0",
		    "id": "1",
		    "Type": "SoilMaps"
		  }
		]
	}

 
Add a type to a repository
__________________________

Add a new Type to a given repository.

::

	POST https://glibrary.ct.infn.it:3000/<repo> 

**URI Parameters**

=========	=============================================================
Parameter	Description
=========	=============================================================
repo		The name of the repository to which we are adding the type to
=========	=============================================================

**Body Parameters**

=====================	================================================================================================================
Parameter				Description
=====================	================================================================================================================
``__Type``				the unique identifier (string) to be assigned to the type
``__VisibleAttrs``		the set of attributes visible through the gLibrary browser (both Web and mobile)
``__ColumnWidth``		size of each column (attribute) in the gLibrary browser
``__ParentID``			types can be organized in a hierarchical structure (tree), and a type can have a subtype. The root type has id 0
``{AttributeName}*``	a set of attributes with their data type (allowed data types are varchar, int, float, timestamp, boolean)
=====================	================================================================================================================

Example::	

	curl -X POST -d “__Type=Documents&__VisibleAttrs=”Topic,Meeting,FileFormat,Size,Creator,Version”&__FilterAttr=”Topic,FileFormat,Creator&Topic=varchar&Version=int&FileFormat=varchar(3)&Creator=string” http://glibrary.ct.infn.it:3000/aginfra 

 
Retrieve Type information
_________________________

Returns the information about a given type of a given repository.

::

	GET https://glibrary.ct.infn.it:3000/<repo>/<type>

Returns	A JSON object with the information of a given type with a list of all its attributes and given data type

 
Example::

	http://glibrary.ct.infn.it:3000/aginfra/SoilMaps

Output::

	{
		TypeName: "Soil Maps",
		Path: "/aginfra/Entries/SoilMaps",
		VisibleAttrs: "Thumb title creator subject description type format language date",
		FilterAttrs: "creator subject publisher contributor type format language rights",
		ColumnWidth: "80 120 60 60 230 100 100 80 80",
		ParentID: "0",
		id: "1",
		Type: "SoilMaps",
		FileName: "varchar(255)",
		SubmissionDate: "timestamp",
		Description: "varchar",
		Keywords: "varchar",
		LastModificationDate: "timestamp",
		Size: "int",
		FileType: "varchar(10)",
		Thumb: "int",
		ThumbURL: "varchar",
		TypeID: "int",
		title: "varchar",
		creator: "varchar",
		subject: "varchar",
		description: "varchar",
		publisher: "varchar",
		contributor: "varchar",
		type: "varchar",
		format: "varchar",
		identifier: "varchar",
		source: "varchar",
		language: "varchar",
		date: "varchar",
		relation: "varchar",
		coverage: "varchar",
		rights: "varchar"
	}

 
List of all the entries of a given type
_______________________________________

List all the entries and its metadata of a given Type in a repository (default limit to 100)

::

	GET https://glibrary.ct.infn.it:3000/<repo>/<type>/entries

**Parameters**

=========	===============================
Parameter	Description
=========	===============================
repo		The name of the repository
type		The name of type
=========	===============================
 

Example:

	curl http://glibrary.ct.infn.it:3000/aginfra/SoilMaps/entries

Output::

	{
		results: 
		[
			{
				id: "51",
				FileName: "",
				SubmissionDate: "2012-11-09 07:02:00",
				Description: "",
				Keywords: "",
				LastModificationDate: "",
				Size: "",
				FileType: "",
				Thumb: "1",
				ThumbURL: "",
				TypeID: "1",
				title: "CNCP 3.0 software",
				creator: "Giovanni Trapatoni",
				subject: "software|soil management",
				description: "CNCP 3.0 database with italian manual. CNCP is the program used for the storing, managing and correlating 	soil observations.",
				publisher: "E	doardo A. C. Costantini",
				contribu	tor: "Giovanni L'Abate",
				type: "application",
				format: "EXE",
				identifier: "http://abp.entecra.it/soilmaps/download/sw-CNCP30.exe",
				source: "http://abp.entecra.it/soilmaps/en/downloads.html",
				language: "it",
				date: "2011-08-03",
				relation: "",
				coverage: "world",
				rights: "All rights reserved"
			},
			{
				id: "53",
				FileName: "",
				SubmissionDate: "2012-11-09 09:37:00",
				Description: "",
				Keywords: "",
				LastModificationDate: "",
				Size: "",
				FileType: "",
				Thumb: "1",
				ThumbURL: "",
				TypeID: "1",
				title: "Benchmark at Beccanello dome, Sarteano (SI)",
				creator: "Edoardo A. C. Costantini",
				subject: "soil analysis|soil map|pedology",
				description: "Form: Soil profile, Survey: Costanza Calzolari, Reporter: Calzolari",
				publisher: "CRA-ABP Research centre for agrobiology and pedology, Florence, Italy",
				contributor: "Centro Nazionale di Cartografia Pedologica",
				type: "Soil map",
				format: "KML",
				identifier: "https://maps.google.com/maps/ms?ie=UTF8&hl=it&msa=0&msid=115138938741119011323.000479a7eafdbdff453bf&z=6",
				source: "https://maps.google.com/maps/ms?ie=UTF8&hl=it&authuser=0&msa=0&output=kml&msid=215926279991638867427.			00479a7eafdbdff453bf",
				language: "en",
				date: "2010-09-22",
				relation: "",
				coverage: "Italy",
				rights: "info@soilmaps.it"
			},
			…
	]



 
Retrieve the metadata of a given entry
______________________________________

Retrieve all the metadata (and replica info) the a given entry

::

	GET https://glibrary.ct.infn.it:3000/<repo>/<type>/id

Returns	The metadata of the given entry and the replicas of the associated digital objects


**Parameters**

=========	================================
Parameter	Description
=========	================================
repo		The name of the repository
type		The name of type
id			The id of the entry to inspect
=========	================================
 
Example::

	curl http://glibrary.ct.infn.it:3000/aginfra/SoilMaps/56

Output::

	{
		results: {
			id: "56",
			FileName: "",
			SubmissionDate: "2012-11-09 10:03:00",
			Description: "",
			Keywords: "",
			LastModificationDate: "",
			Size: "",
			FileType: "",
			Thumb: "1",
			ThumbURL: "",
			TypeID: "1",
			title: "ITALIAN SOIL INFORMATION SYSTEM 1.1 (ISIS)",
			creator: "Costantini E.A.C.|L'Abate G.",
			subject: "soil maps|pedology",
			description: "The WebGIS and Cloud Computing enabled ISIS service is running for online Italian soil data consultation. ISIS is made up of a hierarchy of geo-databases which include soil regions and aim at correlating the soils of Italy with those of other European countries with respect to soil typological units (STUs), at national level, and soil sub-systems, at regional level",
			publisher: "Consiglio per la Ricerca e la sperimentazione in Agricoltura (CRA)-(ABP)|Research centre for agrobiology and pedology, Florence, Italy",
			contributor: "INFN, Division of Catania|agINFRA Science Gateway|",
			type: "",
			format: "CSW",
			identifier: "http://aginfra-sg.ct.infn.it/isis",
			source: "http://aginfra-sg.ct.infn.it/webgis/cncp/public/",
			language: "en",
			date: "2012-04-01",
			relation: "Barbetti R. Fantappi M., L Abate G., Magini S., Costantini E.A.C. (2010). The ISIS software for soil correlation and typology creation at different geographic scales. In: Book of Extended Abstracts of the 4th Global Workshop on Digital Soil Mapping, CRA, Rome, 6pp",
			coverage: "Italy",
			rights: "giovanni.labate@entecra.it",
			"Replicas": [
    		 	{
    		 	  "url": "https://unipa-se-01.pa.pi2s2.it/dpm/pa.pi2s2.it/home/vo.aginfra.eu/aginfra/maps_example.tif",
    		 	  "enabled": "1"
    		 	},
    		 	{
    		 	  "url": "https://inaf-se-01.ct.pi2s2.it/dpm/ct.pi2s2.it/home/vo.aginfra.eu/aginfra/maps_example.tif",
    		 	  "enabled": "1"
    		 	},
    		 	{
    		 	  "url": "https://unict-dmi-se-01.ct.pi2s2.it/dpm/ct.pi2s2.it/home/vo.aginfra.eu/aginfra/maps_example.tif",
    		 	  "enabled": "0"
    		 	}
   			]
		}
	}


 
Add a new entry
_______________

Add a new entry with its metadata of a given type

::

	POST https://glibrary.ct.infn.it:3000/<repo>/<type>/

**Parameters**

=========	==========================
Parameter	Description
=========	==========================
``repo``	The name of the repository
``type``	The if of the type
=========	==========================

**Body Parameters**

====================	===============================================================================================================
Parameter				Description
====================	===============================================================================================================
``__Replicas``			A comma separated list of the replicas of the annotated digital object
``__ThumbData``			An optional base64 string representing the thumbnail of the digital object
``{AttributeName}*``	a set of attributes with their data type (allowed data types are varchar, int, float, timestamp, boolean)
====================	================================================================================================================

Example::

	curl -X POST -d “__Replicas=https://prod-se-03.ct.infn.it/dpm/ct.infn.it/home/vo.aginfra.eu/test/maptest.jpg&FileName=maptest.jpg&creator=Bruno&title=Italian%20maps%20example” http://glibrary.ct.infn.it:3000/aginfra/SoilMaps 



Delete an entry
________________

Delete an entry from a repository of the given type

::

	DELETE https://glibrary.ct.infn.it:3000/<repo>/<type>/id

**Parameters**

=========	===============================
Parameter	Description
=========	===============================
``repo``	The name of the repository
``type``	The name of type
``id``		Id of the entry to be deleted
=========	===============================
