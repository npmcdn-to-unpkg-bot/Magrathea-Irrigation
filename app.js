"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var scheduleBackgroundJob = require('./src/server/backgroundjobs/schedule');
var UUID = require('simply-uuid');
var routeManagement = require('./src/server/modules/routeManagement.js');
let log = require('technicolor-logger');

var app = express();
log.init(require('./config.json'));

global.log = log;

// view engine setup
app.set('views', path.join(__dirname, 'src/client/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  genid: function(req) {
    return UUID.generate(); // use UUIDs for session IDs
  },
  secret: 'almost fear general article',
  resave: false,
  saveUninitialized: true
}))
app.use(cookieParser());
app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));


routeManagement.setup(app);
app.get('/', function(req,res,next) {
    res.render("index",{});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect('/');
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

scheduleBackgroundJob.start();

module.exports = app;
