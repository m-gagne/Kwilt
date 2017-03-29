var argv = require('minimist')(process.argv.slice(2));
var DocumentClient = require('documentdb').DocumentClient;

if( !argv.host || !argv.key ) {
  console.log("Usage: node setup_documentdb_database.js --host <document db host endpoint> --key <documentdb master key>")
  return;
}

var host = argv.host;
var masterKey = argv.key;

var client = new DocumentClient(host, {masterKey: masterKey});

var databaseDefinition = { id: 'kwilt2' };
var collectionDefinition = { id: 'files' };

client.createDatabase(databaseDefinition, function(err,database) {
  if(err) return console.log(err);

  console.log('Database "' + databaseDefinition.id + '" created.');

  client.createCollection(database._self, collectionDefinition, function(err, collection) {
    if(err) return console.log(err);
    
    console.log('Collection "' + collectionDefinition.id + '" created.');
  });
});