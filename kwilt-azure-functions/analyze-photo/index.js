var https = require('https');

module.exports = function (context, message) {
  logInfo(context, 'Analyzing Image Id: ' + message.id)
  logVerbose(context, 'Queue Message:\n' + JSON.stringify(message));

  // Validate Configuration
  if (!process.env.OcpApimSubscriptionKey) {
    throwError(context, 'Missing Configuration, OcpApimSubscriptionKey not configured in Application Settings.');
  }

  // Validate Message
  if (!message.thumbnail_url) {
    throwError(context, 'Invalid Message, thumbnail_url missing.');
  }

  // Define Vision API options
  var options = {
    host: 'westus.api.cognitive.microsoft.com',
    port: 443,
    path: '/vision/v1.0/analyze?visualFeatures=Categories,Tags,Description,Faces,ImageType,Color,Adult&details=&language=en',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.OcpApimSubscriptionKey
    }
  };

  logVerbose(context, 'Thumbnail Url: ' + message.thumbnail_url);

  var req = https.request(options, function(res) {    
    res.setEncoding('utf8');
    
    res.on('data', function (data) {
      logVerbose(context, 'Vision API Response\n' + data);
      
      var visionData = JSON.parse(data);

      // Was the image successfully processed
      switch(res.statusCode) {
        case 200: // Sucess
          updateFileMetaData(message, visionData);
          break;
        case 400: // Error processing image
          var errorMessage = visionData.message ? visionData.message : "Unknown error processing image";
          logInfo(context, errorMessage);
          updateFileMetaData(message, null, visionData);
          break;
        case 403: // Out of call volume quota
          context.done(new Error('Out of cal volume quota'));
          return;
        case 429: // Rate limit is exceeded
          context.done(new Error('Rate limit is exceeded'));
          return;
      }

      // Set the object to be stored in Document DB
      context.bindings.outputDocument = JSON.stringify(message);  

      context.done();
    });  
  });

  req.on('error', function(e) {
    logVerbose(context, 'Vision API Error\n' + JSON.stringify(e));
    throwError(context, e.message);
  });

  // write data to request body
  var data = {
    url: message.thumbnail_url
  };

  req.write(JSON.stringify(data));
  req.end();  
};


function updateFileMetaData(message, visionData, error) {
      // Document DB requires ID to be a string
      // Convert message id to string
      message.id = message.id + '';      

      // Keep a record of the raw/unedited Vision data
      message['azure_vision_data'] = {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        data: visionData,
        error: error
      };

      if( visionData ) {
        // Flatten/append vision data to the file object
        message['isAdultContent'] =  visionData.adult.isAdultContent;
        message['isRacyContent'] =  visionData.adult.isRacyContent;
        message['auto_tags'] = extractConfidenceList(visionData.tags, 'name', 0.1);
        message['auto_categories'] = visionData.categories ? extractConfidenceList(visionData.categories, 'name', 0.1) : [];
        message['auto_captions'] =  extractConfidenceList(visionData.description.captions, 'text', 0.1);
        message['auto_description_tags'] =  visionData.description.tags;
        message['auto_dominantColorForeground'] =  visionData.color.dominantColorForeground;
        message['auto_dominantColorBackground'] =  visionData.color.dominantColorBackground;
        message['auto_accentColor'] =  visionData.color.accentColor;
        message['auto_isBWImg'] =  visionData.color.isBWImg;
        message['auto_clipArtType'] =  visionData.imageType.clipArtType;
        message['auto_lineDrawingType'] =  visionData.imageType.lineDrawingType;
      }

      // Convert existing tags field from comma seperated string to array
      if( message.tags && typeof message.tags === 'string' ) {
        message.tags = message.tags.split(',');
      } else {
        message.tags = [];
      }
      
      // Azure Search requires location to be a single field
      if( message.latitude && typeof message.latitude === 'number') {
        message['location'] = {
          type: 'Point',
          coordinates: [message.longitude, message.latitude]
        }
      }      
}

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

// Extracts a list of values by field from an array of objects
// where the confidence value is greater than or equal to the
// optional minConfidenceValue.
function extractConfidenceList(objArray, field, minConfidenceValue)
{
  if( Object.prototype.toString.call( objArray ) !== '[object Array]' ) {
    throw new Error("objArray (type: " + Object.prototype.toString.call( objArray ) + ") in extractConfidenceList is not an array.");
  }

  if( !field || typeof field !== 'string' ) {
    throw new Error("field in extractConfidenceList is missing or not an string.");
  }

  // If not min confidence value specified or value is undefined set to 0
  if( !minConfidenceValue ) { minConfidenceValue = 0; }

  var list = new Array();

  objArray.forEach(function (obj) {
    // Do we need to do a confidence check?
    if( minConfidenceValue > 0 && typeof obj['confidence'] === 'number' )
    {
      // Is confidence >= min required?
      if( obj['confidence'] >= minConfidenceValue ) {
        list.push(obj[field]);
      }
    }
    else
    {
      // No check needed push field into array
      list.push(obj[field]);
    }
  });

  return list;
}