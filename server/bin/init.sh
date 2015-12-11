!#/bin/bash
echo "creating admin user"
node createAdmin.js
echo "creating default roles"
node createRoles.js
echo "creating default ACLs"
node createACLRules.js
echo "done"
echo "You can start the server"
