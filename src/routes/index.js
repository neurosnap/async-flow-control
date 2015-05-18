'use strict';

import polyfill from 'babel/polyfill';
import express from 'express';
import _ from 'lodash';
import Promise from 'bluebird';
import async from 'async';
import { get } from 'needle';

import { api_key, sites } from '../../config';
import logger from '../logger';

var router = express.Router();
var getAsync = Promise.promisify(get);
var chartbeat_url = 'http://api.chartbeat.com';

if (typeof sites === 'undefined' || !Array.isArray(sites) || sites.length < 1) {
  throw new Error('`sites` in config.js must be an array and not empty');
}

// Required to handle an array of promises
// https://github.com/petkaantonov/bluebird/blob/master/API.md#promisecoroutineaddyieldhandlerfunction-handler---void
Promise.coroutine.addYieldHandler(function(yielded_value) {
  if (Array.isArray(yielded_value)) return Promise.all(yielded_value);
});

router.get('/', function(req, res, next) {
  res.render('index');
});

// Callback hell
router.get('/callback-hell/', function(req, res, next) {
  let articles = [];
  get(compile_url('freep.com'), function(err, freep_response) {
    if (err) throw err;
    articles = articles.concat(process_response(freep_response));
    get(compile_url('detroitnews.com'), function(err, det_response) {
      if (err) throw err;
      articles = articles.concat(process_response(det_response));
      get(compile_url('battlecreekenquirer.com'), function(err, battle_response) {
        if (err) throw err;
        articles = articles.concat(process_response(battle_response));
        get(compile_url('hometownlife.com'), function(err, hometown_response) {
          if (err) throw err;
          articles = articles.concat(process_response(hometown_response));
          get(compile_url('lansingstatejournal.com'), function(err, lansing_response) {
            if (err) throw err;
            articles = articles.concat(process_response(lansing_response));
            get(compile_url('livingstondaily.com'), function(err, living_response) {
              if (err) throw err;
              articles = articles.concat(process_response(living_response));
              get(compile_url('thetimesherald.com'), function(err, herald_response) {
                if (err) throw err;
                articles = articles.concat(process_response(herald_response));
                res.json(articles);
              });
            });
          });
        });
      });
    });
  });
});

// Callbacks with counter
router.get('/callback-counter/', function(req, res, next) {
  let articles = [];
  let response_counter = 0;
  for (let i = 0; i < sites.length; i++) {
    let site = sites[i];
    get(compile_url(site), function(index, err, response) {
      if (err) throw err;
      articles = articles.concat(process_response(response));
      response_counter++;
      if (response_counter == sites.length) {
        res.json(articles);
      }
    }.bind(this, i));
  }
});

// Third party library 'async' using parallel
router.get('/parallel/', function(req, res, next) {
  function parallel_cb(site) {
    return function(callback) {
      get(compile_url(site), function(err, response) {
        callback(err, response);
      });
    };
  }
  //[for (site of sites) parallel_cb(site))];
  async.parallel([
    parallel_cb('detroitnews.com'),
    parallel_cb('freep.com'),
    parallel_cb('battlecreekenquirer.com'),
    parallel_cb('hometownlife.com'),
    parallel_cb('lansingstatejournal.com'),
    parallel_cb('livingstondaily.com'),
    parallel_cb('thetimesherald.com')
  ], function(err, responses) {
    if (err) throw err;
    let articles = [];
    for (let i = 0; i < responses.length; i++) {
      articles = articles.concat(process_response(responses[i]));
    }
    res.json(articles);
  });
});

// Third party library 'bluebird' promise
router.get('/promise/', function(req, res, next) {
  let current = Promise.resolve();
  Promise.map(sites, function(url) {
    current = current.then(function() {
      return getAsync(compile_url(url));
    });
    return current;
  }).map(function(response) {
    return process_response(response);
  }).then(function(results) {
    res.json(_.flatten(results));
  }).catch(function(err) {
    throw err;
  });
});

// Third party library 'bluebird' coroutines
router.get('/coroutine/', Promise.coroutine(function* (req, res, next) {
  let articles = [];
  let responses;
  try {
    //let responses = yield [for (site of sites) getAsync(compile_url(site))];
    responses = yield [
      getAsync(compile_url('detroitnews.com')),
      getAsync(compile_url('freep.com')),
      getAsync(compile_url('battlecreekenquirer.com')),
      getAsync(compile_url('hometownlife.com')),
      getAsync(compile_url('lansingstatejournal.com')),
      getAsync(compile_url('livingstondaily.com')),
      getAsync(compile_url('thetimesherald.com'))
    ];
  } catch (err) {
    throw err;
  }
  for (let i = 0; i < responses.length; i++) {
    articles = articles.concat(process_response(responses[i]));
  }
  res.json(articles);
}));

function process_response(response) {
  if (Array.isArray(response)) {
    response = response[0];
  }
  if (response.statusCode != 200) {
    console.log(`Status Code: ${response.statusCode}: ${response.statusMessage}`);
  }
  let body = response.body || response[1];
  if (body.hasOwnProperty('error') || !body.hasOwnProperty('pages')) {
    console.log(`${body.error}: ${response.req.path}`);
    return [];
  }
  let pages = body.pages;
  let articles = [];
  for (let i = 0; i < pages.length; i++) {
    let article = pages[i];
    if (article.path == '') continue;
    if (!is_article(article.path)) continue;

    articles.push({
      path: article.path,
      title: article.title,
      visits: article.stats.visits
    });
  }
  return articles;
}

function is_article(url) {
  if (url.indexOf('story/') >= 0) return true;
  if (url.indexOf('article/') >= 0) return true;
  if (url.indexOf('picture-gallery/') >= 0) return true;
  if (url.indexOf('longform/') >= 0) return true;
  return false;
}

function compile_url(host, akey=api_key, limit=50) {
  if (typeof akey === 'undefined') {
    throw new Error('`api_key` not found in config.js');
  }
  return `${chartbeat_url}/live/toppages/v3/?limit=${limit}&apikey=${akey}&host=${host}`;
};

module.exports = router;
