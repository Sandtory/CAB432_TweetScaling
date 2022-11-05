// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'ap-southeast-2'});
const analyzer = require("./../services/sentimentAnalysis");
const natural = require('natural');
// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
  ExpressionAttributeNames: {
    "#PK": "qut-username",
    "#T": "Text"
   },
   ExpressionAttributeValues: {
    ':u': {S: 'n11398141@qut.edu.au'},
    ':id' : {S: '1588773635979825152'},
    ':msg': {S: 'h'}
  },
  KeyConditionExpression: 'TWITTER_ID = :id AND #PK = :u',
  ProjectionExpression: '#PK, TWITTER_ID, #T',
  FilterExpression: 'contains (#T, :msg)',
  TableName: 'TweetAnalysis'
};

ddb.query(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    //console.log("Success", data.Items);
    data.Items.forEach(function(element, index, array) {
      console.log(element.TWITTER_ID.S + " (" + element.Text.S + ")");
      /*console.log(analyzer.analyzeTweet(element.Text.S));
      var spellcheck = new natural.Spellcheck(element.Text.S);
      spellcheck.isCorrect('cat'); 
      spellcheck.getCorrections(element.Text.S, index);
      console.log(spellcheck);*/
    });
  }
});




