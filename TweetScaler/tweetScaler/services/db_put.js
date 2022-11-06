// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'ap-southeast-2'});

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

params = {
  TableName: 'newAnalysis',
  Item: {
      'HASHKEY': 'qut-username',
      'qut-username': 'n11398141@qut.edu.au',
      "TWITTER_ID": `${json.data.id}`,
      'Text': `${json.data.text}`,
      'Tag': `${tag}`
    }
}
docClient.put(params, function(err, data) {
  if (err) {
      console.log("Error", err);
  } else {
      console.log("Success", data);
  }
});  
