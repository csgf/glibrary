/**
 * Created by Antonio Di Mariano on 21/07/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var ds = loopback.createDataSource({
  connector: require('loopback-component-storage'),
  provider: 'openstack',
  username: 'acaland',
  password: 'demo2015',
  authUrl: 'https://stack-server-01.ct.infn.it:35357'
});
var container = ds.createModel('container');
app.model(container);

