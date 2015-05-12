'use strict';

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import log4js from 'log4js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import { db } from '../config';
import mail from './mail';
import logger from './logger';
import routes from './routes/index';

var app = express();
var router = express.Router();

// view engine setup
app.set('views', path.join(path.dirname(__dirname), 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(path.dirname(__dirname), 'public')));
app.use(log4js.connectLogger(logger, { level: log4js.levels.DEBUG }));

app.use('/', routes);

router.get('/error', function(req, res, next) {
  return next(new Error(app.get('env')));
});

app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.error(err);

  mail.mailOptions.text = `
  Status: ${err.status}
  -----
  Request: ${req.originalUrl}
  -----
  Error: ${err.message}
  -----
  Stacktrace: ${err.stack}`;

  mail.transporter.sendMail(mail.mailOptions, function(error, info) {
    logger.error(error);
  });

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

process.on('SIGTERM', function () {
  logger.info("Closing nodejs application ...");
  app.close();
});

module.exports = app;
