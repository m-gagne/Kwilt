var https = require('https');

module.exports = function (context, req) {
  logInfo(context, 'Refreshing Search Indexer : ' + context.bindingData.id)

  // Validate Configuration
  if (!process.env.SearchServiceName) throwError(context, 'Missing Configuration: "SearchServiceName" not configured in Application Settings.');
  if (!process.env.SearchServiceAdminKey) throwError(context, 'Missing Configuration: "SearchServiceAdminKey" not configured in Application Settings.');

  // Define Search Management API options to run the specified Indexer
  var options = {
    host: process.env.SearchServiceName + '.search.windows.net',
    port: 443,
    path: '/indexers/' + context.bindingData.id + '/run?api-version=2015-02-28',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'api-key': process.env.SearchServiceAdminKey
    }
  };

  var req = https.request(options, function(res) {    
    res.setEncoding('utf8');
    
    res.on('data', function (data) {
      logVerbose(context, 'Search API Response: \n' + data);
      
      // Was the indexer successfully started?
      if( res.statusCode != 200 ) {
          var errorMessage = ( data && data.error&& data.error.message ) ? data.error.message : 'Unkown error, status code: ' + res.statusCode; 
          throwError(context, errorMessage);
      }

      context.done();
    });  
  });

  req.on('error', function(e) {
    logVerbose(context, 'Search API Error\n' + JSON.stringify(e));
    throwError(context, e.message);
  });

  req.end();  
  context.done();
};

function throwError(context, message) {
  logVerbose(context, 'Error: ' + message);
  throw new Error(message); 
}

function logInfo(context, message) {
    context.log('+[Info] ' + message);

}

function logVerbose(context, message) {
  if( process.env.VerboseLogging ) {
    context.log('![Verbose] ' + message);
  }
}