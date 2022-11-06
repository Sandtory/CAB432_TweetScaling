// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'ap-southeast-2'});
const PK = 'n11398141@qut.edu.au';

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
  RequestItems: {
    'newAnalysis': {
      Keys: [
        {'qut-username': {S: 'tre'}},
        {'qut-username': {S: 'syv'}},
        {'qut-username': {S: 'åtte'}}
      ],
      ProjectionExpression: 'TWITTER_ID, n11398141@qut.edu.au'
    }
  }
};

ddb.batchGetItem(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    data.Responses.TABLE_NAME.forEach(function(element, index, array) {
      console.log(element);
    });
  }
});
