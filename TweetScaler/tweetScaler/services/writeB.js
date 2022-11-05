
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'ap-southeast-2'});

// Create DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
  RequestItems: {
    "TweetAnalysis": [
       {
         PutRequest: {
           Item: {
             "qut-username": { "S": "n11398141@qut.edu.au" },
                "qut-username": { "S": "n11398141@qut.edu.au"},
                "TWITTER_ID": { "S": "" }
           }
         }
       },
       {
         PutRequest: {
           Item: {
            "qut-username": { "S": "n11398141@qut.edu.au" },
                "qut-username": { "S": "n11398141@qut.edu.au" },
                "TWITTER_ID": { "S": "åtte" }
           }
         }
       }
    ]
  }
};

ddb.batchWriteItem(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});

