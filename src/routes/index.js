'use strict';

import polyfill from 'babel/polyfill';
import express from 'express';
import _ from 'lodash';
import Promise from 'bluebird';
import async from 'async';
import { get } from 'needle';

import config from '../../config';
import logger from '../logger';

var router = express.Router();
var getAsync = Promise.promisify(get);
var chartbeat_url = 'http://api.chartbeat.com';

// Required to handle an array of promises
// https://github.com/petkaantonov/bluebird/blob/master/API.md#promisecoroutineaddyieldhandlerfunction-handler---void
Promise.coroutine.addYieldHandler(function(yielded_value) {
  if (Array.isArray(yielded_value)) return Promise.all(yielded_value);
});

router.get('/', function(req, res, next) {
  res.render('index');
});

// Callback hell
router.get('/cbh/', function(req, res, next) {
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
                console.log('RECEIVED ALL DATA, SEND TO BROWSER');
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
router.get('/cbhc/', function(req, res, next) {
  let articles = [];
  let response_counter = 0;
  for (let i = 0; i < config.sites.length; i++) {
    let site = config.sites[i];
    get(compile_url(site), function(index, err, response) {
      if (err) throw err;
      articles = articles.concat(process_response(response));
      response_counter++;
      if (response_counter == config.sites.length) {
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

  async.parallel([
    parallel_cb('detroitnews.com'),
    parallel_cb('freep.com'),
    parallel_cb('battlecreekenquirer.com'),
    parallel_cb('hometownlife.com'),
    parallel_cb('lansingstatejournal.com'),
    parallel_cb('livingstondaily.com'),
    parallel_cb('thetimesherald.com')
  ], function(err, responses) {
    let articles = [];
    for (let i = 0; i < responses.length; i++) {
      articles = articles.concat(process_response(responses[i]));
    }
    res.json(articles);
  });
});

function process_response(response) {
  let body = response.body;
  if (response.statusCode != 200) {
    console.log(`Status Code: ${response.statusCode}: ${response.statusMessage}`);
  }
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

function compile_url(host, api_key=config.api_key, limit=50) {
  return `${chartbeat_url}/live/toppages/v3/?limit=${limit}&apikey=${api_key}&host=${host}`;
};

module.exports = router;
