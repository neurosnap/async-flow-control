'use strict';

import debug from 'debug';
var logger = debug("app:app");
import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import routes from './routes';

var app = express();
var router = express.Router();

var PACKAGE_DIR = path.dirname(__dirname);

app.set('views', path.join(PACKAGE_DIR, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(PACKAGE_DIR + '/public/favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(PACKAGE_DIR, 'public')));

app.use('/', routes);

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

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
