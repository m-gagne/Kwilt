var argv = require('minimist')(process.argv.slice(2));
var DocumentClient = require('documentdb').DocumentClient;

if( !argv.host || !argv.key ) {
  console.log("Usage: node reset_documentdb_files_collection.js --host <document db host endpoint> --key <documentdb master key>")
  return;
}

var host = argv.host;
var masterKey = argv.key;

var client = new DocumentClient(host, {masterKey: masterKey});

var databaseDefinition = { id: 'kwilt' };
var collectionDefinition = { id: 'files' };

var dbLink = 'dbs/' + databaseDefinition.id;
var collectionLink = dbLink + '/colls/' + collectionDefinition.id;

client.deleteCollection(collectionLink, function(err) {
    if(err) return console.log(err);

    console.log('Collection "' + collectionLink + '" deleted.');

    client.createCollection(dbLink, collectionDefinition, function(err, collection) {
        if(err) return console.log(err);

        console.log('Collection "' + collectionLink + '" created.');
    });
});

// Source: https://raw.githubusercontent.com/Azure/azure-documentdb-node/master/samples/DatabaseManagement/app.js
function findDatabaseById(client, databaseId, callback) {
    var querySpec = {
        query: 'SELECT * FROM root r WHERE  r.id = @id',
        parameters: [
            {
                name: '@id',
                value: databaseId
            }
        ]
    };

    client.queryDatabases(querySpec).toArray(function (err, results) {
        if (err) {
            handleError(err);
        }
        
        if (results.length === 0) {
            // no error occured, but there were no results returned 
            // indicating no database exists matching the query            
            // so, explictly return null
            callback(null, null);
        } else {
            // we found a database, so return it
            callback(null, results[0]);
        }
    });
};