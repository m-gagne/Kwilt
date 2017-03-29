var argv = require('minimist')(process.argv.slice(2));
var DocumentClient = require('documentdb').DocumentClient;

if( !argv.host || !argv.key ) {
  console.log("Usage: node delete_documentdb_database.js --host <document db host endpoint> --key <documentdb master key>")
  return;
}

var host = argv.host;
var masterKey = argv.key;

var client = new DocumentClient(host, {masterKey: masterKey});

var databaseDefinition = { id: "kwilt" };

findDatabaseById(client, databaseDefinition.id, function(err, database) {
  client.deleteDatabase(database._self, function(err,database) {
    if(err) return console.log(err);

    console.log('Database "' + databaseDefinition.id + '" deleted.');
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