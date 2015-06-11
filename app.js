var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = global.config = require("./config");
var MongoClient = require('mongodb').MongoClient;
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
var mr = global.mr = require('./models/modelResolver');
mr.mapModels();
var indexController = require('./routes/index');
var adminController = require('./routes/admin');
var exportController = require('./routes/export');
indexController.init(app);
adminController.init(app);
exportController.init(app);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

var mongoose = mongoose.connect(config.mongoPath);

MongoClient.connect(config.mongoPath, function(err, db) {
  if (err) throw err;
  console.log("Connected to mongodb on " + config.mongoPath);
  app.db = db;
  global.db = db;
  app.listen(config.port);
  console.log("Analytics running on port " + config.port);
});



module.exports = app;
