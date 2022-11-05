const needle = require('needle');
require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-2'});

const docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const token = process.env.TWITTER_BEARER_TOKEN;

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";


async function getRequest(query) {

    const params = {
        'query': `${query}`,
        'max_results': 10
    }

    const res = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2RecentSearchJS",
            "authorization": `Bearer AAAAAAAAAAAAAAAAAAAAANuoigEAAAAAu6gBz7x3x4wn2MtAjmj94qCooyI%3DEOVRiYLrj96QyInMbBGKYcGhrJS80ZDUckcF1FlluDCb76mPAd`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request');
    }
}

(async () => {
    try {
        // Make request
        const response = await getRequest();
        console.log(response);
        var dbParams = {
            TableName: 'tirede',
            Item: {
                'HASHKEY': 'qut-username',
                'qut-username': 'n11398141@qut.edu.au',
                "TWITTER_ID": `${id}`,
                'Text': `${text}`
            }
        };
        console.dir(response, {
            depth: null
        });
        docClient.put(dbParams, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
            }
        });
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();