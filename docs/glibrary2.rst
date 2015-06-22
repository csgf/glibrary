#############
gLibrary 2.0 
#############

REST API v2.0 (Draft)
*********************


Repositories
============ 


GET	/v1/repos/


Elenco di tutti i repositories hostati sul server

POST /v1/repos/
Crea un nuovo repository

HEAD /v1/repos/<repo_name>
Mostra le info di configurazione (metadati) del repository <repo_name>

DELETE /v1/repos/<repo_name>
Cancella il repository <repo_name>

PUT /v1/repos/<repo_name>
Modifica le info di configurazione (metadati) del depository <repo_name>

Collections
===========

POST /v1/repos/<repo_name>/
Crea una nuova collection o importa una tabella di un db esistente come collection nel repository <repo_name>. Il nome della collections viene passato come parametro nel body

GET /v1/repos/<repo_name>/
Elenco di tutte le collection del repository <repo_name>

HEAD /v1/repos/<repo_name>/<collection_name>
Restituisce i metadati della collection <collection_name> del repository <repo_name>

DELETE /v1/repos/<repo_name>/<collection_name>
Cancella la collection <collection_name>

PUT /v1/repos/<repo_name>/<collection_name>
Modifica i metadati della <collection_name>

Items (previously entries)

POST /v1/repos/<repo_name>/<collection_name>/
Crea un nuovo item nella collection <collection_name> con tutti i suoi metadati

GET /v1/repos/<repo_name>/<collection_name>/
Elenco di tutti gli item contenuti nella collection <collection_name>

HEAD /v1/repos/<repo_name>/<collection_name>/<item_id>
Restituisce i metadati dell'item con id <item_id>, incluse le sue eventuali repliche

DELETE  /v1/repos/<repo_name>/<collection_name>/<item_id>
Cancella l'item indicato

PUT /v1/repos/<repo_name>/<collection_name>/<item_id>
Modifica i metadati dell'item indicato

{da discutere} supporto multilingua ai metadati
HEAD /v1/repos/<repo_name>/<collection_name>/<item_id>/i18n/<lang_code>
Restituisce i metadati nella lingua specificata

{da discutere} Related items - next release
GET /v1/repos/<repo_name>/<collection_name>/<item_id>/<related_collection_name>
Restituisce tutti gli item relativi all'idem_id indicato nella <related_collection_name>


Replicas
========

POST /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/
Crea una replica per l'item_id indicato. Restituisce la URL dello storage su cui effettuare un direct upload con operazione di POST o PUT entro pochi secondi

GET /v1/repos/<repo_name>/<collection_name>/<item_id>/replicas/<rep_id>
Restituisce la URL dello storage da cui effettuare un direct download della replica indicata del item con <item_id>