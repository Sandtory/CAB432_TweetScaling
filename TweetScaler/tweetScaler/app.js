var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
Dotenv = require('dotenv');
Twitter = require('twitter-v2');
Twit = require('twit')


var indexRouter = require('./routes/index');
var twitterRouter = require('./routes/twitter');
const { access } = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/twitter', twitterRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const qs = require('querystring');
const request = require('request');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const util = require('util');

const get = util.promisify(request.get);
const post = util.promisify(request.post);

const consumer_key = 'jQ3sK7mpbUHg9uttoRzxD6RHo'; // Add your API key here
const consumer_secret = 'fnFg9oMBhVR4SlMpebuJtMOQVIHp3kZGD0YFS17IFQOHoUwOv8'; // Add your API secret key here

const requestTokenURL = new URL('https://api.twitter.com/oauth/request_token');
const accessTokenURL = new URL('https://api.twitter.com/oauth/access_token');
const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
const endpointURL = new URL('https://api.twitter.com/labs/2/tweets');

const params = {
  ids: '1138505981460193280',
  'tweet.fields': 'created_at',
};

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const oAuthConfig = {
    callback: 'oob',
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
  };

  const req = await post({url: requestTokenURL, oauth: oAuthConfig});
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function accessToken({oauth_token, oauth_token_secret}, verifier) {
  const oAuthConfig = {
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    token: oauth_token,
    token_secret: oauth_token_secret,
    verifier: verifier,
  }; 
  
  const req = await post({url: accessTokenURL, oauth: oAuthConfig});
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

async function getRequest({oauth_token, oauth_token_secret}) {
  const oAuthConfig = {
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    token: oauth_token,
    token_secret: oauth_token_secret,
  };

  const req = await get({url: endpointURL, oauth: oAuthConfig, qs: params, json: true});
  if (req.body) {
    return req.body;
  } else {
    throw new Error('Cannot get an OAuth request token');
  }
}

(async () => {
  try {

    // Get request token
    const oAuthRequestToken = await requestToken();
    
    // Get authorization
    authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);
    console.log('Please go here and authorize:', authorizeURL.href);
    const pin = await input('Paste the PIN here: ');
    
    // Get the access token
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());

    // Make the request
    const response = await getRequest(oAuthAccessToken);
    console.log(response);
  } catch(e) {
    console.error(e);
    process.exit(-1);
  }
  process.exit();
})();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



const apikey = 'jQ3sK7mpbUHg9uttoRzxD6RHo'
const apikeysecret = 'fnFg9oMBhVR4SlMpebuJtMOQVIHp3kZGD0YFS17IFQOHoUwOv8'
const accesstoken = '1373027712-cscCnV4Kpc0atUgJu00UCWtxsr1dbperfyEu9io'
const accesstokensecret = 'X33Nzo0r5vShf9Qc0EdIqgmJCFOskYzOcxk4N7sdCKCEU'


// New twitter iobject from twitterV2 npm
var T = new Twitter({
  //consumer_key: process.env.API_KEY,
  //consumer_secret: process.env.API_KEY_SECRET,
  //bearer_token: process.env.BEARER_TOKEN
  //access_token_key: process.env.ACCESS_TOKEN_KEY,
  //access_token_secret: process.env.ACCESS_TOKEN_SECRET
  consumer_key: apikey,
  consumer_secret: apikeysecret,
  access_token_key: accesstoken,
  access_token_secret: accesstokensecret
});

/* const stream = client.stream(path, urlParams);

// Close the stream after 30s.
setTimeout(() => {
  stream.close();
}, 30000);

for await (const { data } of stream) {
  console.log(data);
} */

(async () => {
  T.stream('search/tweets', { q: '#tesla since:2020-04-15', count: 100 }, function(err, data, response) {
    const tweets = data.statuses
       //.map(tweet => `LANG: ${franc(tweet.text)} : ${tweet.text}`) //CHECK LANGUAGE
       //.map(tweet => tweet.text)
       //.filter(tweet => tweet.toLowerCase().includes('elon'));
       console.log(tweets);
  })
})
module.exports = app;

