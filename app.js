var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var app = express();
require('./models');
var bcrypt = require('bcrypt'); // security for password

var User = mongoose.model("User");




mongoose.connect('mongodb://localhost:27017/saasdb')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//defining a request handler
app.get('/', function(req, res,next) {
   res.render('index', {title: "SaaS Tutorial"} )
})
//retrieving the data
app.post('/signup', function (req, res,next) {
  User.findOne({
    email: req.body.email
  }, function (err, user ){
     if(err) return next(err);
     if(user) return next({message: "User already exists"});
    let newUser = new User ({
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10) // number represent the amount of security, higher number more secure but also slower
    })
    newUser.save();
  });

  console.log(req.body);

})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  next();
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

module.exports = app;
