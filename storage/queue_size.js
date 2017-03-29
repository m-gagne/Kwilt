var azure = require('azure-storage');
var argv = require('minimist')(process.argv.slice(2));

if( !argv.storageAccountName || !argv.storageAccountKey || !argv.queueName ) {
  console.log("Usage: node queue_size.js --storageAccountName <storage account name> --storageAccountKey <storage account key> --queueName <queue name>")
  return;
}
var account = argv.storageAccountName;
var key = argv.storageAccountKey;
var queue = argv.queueName;

process.env.AZURE_STORAGE_ACCOUNT = account;
process.env.AZURE_STORAGE_ACCESS_KEY = key;

var queueSvc = azure.createQueueService();

var refreshOutput = function() {
  queueSvc.getQueueMetadata(queue, function(error, result, response){
    if(!error){
      process.stdout.write(' + ' + queue + ': ' + result.approximateMessageCount + '              \r');
    }
  });

  setTimeout(refreshOutput, 500);  
}

process.stdout.write('\n\nQueue Size\n++++++++++++++++++++++++++++++++++++++\n\n');
refreshOutput();

