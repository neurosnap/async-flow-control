'use strict';

import log4js from 'log4js';

import { log } from '../config';

log4js.configure(log);

var logger = log4js.getLogger('dev');
logger.setLevel('DEBUG');

module.exports = logger;