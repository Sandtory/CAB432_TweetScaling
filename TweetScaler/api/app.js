const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const needle = require("needle");

require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const token = process.env.TWITTER_BEARER_TOKEN;
const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
let rules = [];

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*router.post('/search', function(req , res) {
  console.log(new Date(), "In twitter route GET / req.query=", req.query);
  const searchWord = req.body.q; 
  (async () => {
    try {
        // Make request
        const response = await getAllRules();
        //let ruleList = response;
        deleteAllRules(response);
        let rule = {value: `${searchWord} `, tag: `${searchWord}`, lang: 'en'};
        rules.push(rule);
        setRules();

        //return result
        res.json({ response });
    } catch (e) {
        console.log(e);
        console.error(e);
        process.exit(1);
    }
    streamConnect(0);
  })();
});*/

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

(async () => {
    let currentRules;

    try {
      // Gets the complete list of rules currently applied to the stream
        currentRules = await getAllRules();

      // Delete all rules. Comment the line below if you want to keep your existing rules.
      //await deleteAllRules(currentRules);

      // Add rules to the stream. Comment the line below if you don't want to add new rules.
      //await setRules();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    // Listen to the stream.
    //streamConnect(0);
})();

module.exports = app;
