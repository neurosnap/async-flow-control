'use strict';

import polyfill from 'babel/polyfill';
import express from 'express';
var router = express.Router();
import _ from 'lodash';
import Promise from 'bluebird';
import { get } from 'needle';
var getAsync = Promise.promisify(get);

import config from '../../config';
import logger from '../logger';

// Required to handle an array of promises
// https://github.com/petkaantonov/bluebird/blob/master/API.md#promisecoroutineaddyieldhandlerfunction-handler---void
Promise.coroutine.addYieldHandler(function(yielded_value) {
  if (Array.isArray(yielded_value)) return Promise.all(yielded_value);
});

router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
