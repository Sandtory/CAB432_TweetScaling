var express = require('express');
var router = express.Router();
const axios = require('axios');
const needle = require("needle");

require('dotenv').config();

var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'ap-southeast-2'});

// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const token = process.env.TWITTER_BEARER_TOKEN;
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
let params;
let rules = []


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(new Date(), "In twitter route GET / req.query=", req.query);
  res.render('index', { title: 'Express' });
  
});

router.post('/search', function(req , res) {
  console.log(new Date(), "In twitter route GET / req.query=", req.query);
  const searchWord = req.body.q; 
  (async () => {
    try {
        // Make request
        const response = await getAllRules();
        deleteAllRules(rules);
        deleteAllRules(response);
        let rule = {value: `${searchWord} `, tag: `${searchWord}`, lang: 'en'};
        rules.push(rule);
        setRules(rules);
        console.log(rules);
        console.log(response);
        
        //return result
        res.json({ response });
        streamConnect(0);
    } catch (e) {
        console.log(e);
        console.error(e);
        process.exit(1);
    }
  })();
});

async function getAllRules() {

    const response = await needle('get', rulesURL, {
        headers: {
          "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
      console.log("Error:", response.statusMessage, response.statusCode)
      throw new Error(response.body);
    }

    return (response.body);
}

async function deleteAllRules(rules) {

    if (!Array.isArray(rules.data)) {
      return null;
    }

    const ids = rules.data.map(rule => rule.id);

    const data = {
        "delete": {
          "ids": ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`
        }
    })

    if (response.statusCode !== 200) {
      throw new Error(response.body);
    }

    return (response.body);
}

async function setRules() {
    const data = {
      "add": rules
    }

    const response = await needle('post', rulesURL, data, {
      headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`,
        }
    })

    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }
    return (response.body);
}


function streamConnect(retryAttempt) {

    const stream = needle.get(streamURL, {
        headers: {
          "User-Agent": "v2FilterStreamJS",
          "Authorization": `Bearer ${token}`,
        },
        timeout: 20000
    });

    stream.on('data', data => {
        try {
          const json = JSON.parse(data);
          console.log(json);
          //console.log(json.data.id);

          params = {
            TableName: 'TweetAnalysis',
            Item: {
                'HASHKEY': 'qut-username',
                'qut-username': 'n11398141@qut.edu.au',
                "TWITTER_ID": `${json.data.id}`,
                'Text': `${json.data.text}`
              }
          }
          docClient.put(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
            }
          });
          //console.log(params);
          // A successful connection resets retry count.
          retryAttempt = 0;
        } catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
              console.log(data.detail)
              process.exit(1)
            } else {
              // Keep alive signal received. Do nothing.
            }
        }
    }).on('err', error => {
      if (error.code !== 'ECONNRESET') {
          console.log(error.code);
          process.exit(1);
        } else {
          // This reconnection logic will attempt to reconnect when a disconnection is detected.
          // To avoid rate limits, this logic implements exponential backoff, so the wait time
          // will increase if the client cannot reconnect to the stream. 
            setTimeout(() => {
              console.warn("A connection error occurred. Reconnecting...")
              streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;
}

module.exports = router;
