var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var app = express();
require('./models');
var bcrypt = require('bcrypt'); // security for password
var expressSession = require('express-session') ;
var User = mongoose.model("User");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



mongoose.connect('mongodb://localhost:27017/saasdb')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession ( {
  secret: "dehca8d8ad7ada9hda9dh;[;d[121d11ed1d1ddasdadad2112948408fdsfrjieod83"
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: "email",
  passwordField: "password"
}, function(email, password, next) {
  User.findOne({
    email: email
  }, function (err, user) {
    if(err) return next(err);
    if (!user | !bcrypt.compareSync(password, user.passwordHash)) {
       return next({message: 'Email or password incorrect'})
    }
    next(null, user);
  })
}));

passport.use("signup-local", new LocalStrategy({
  usernameField: "email",
  passwordField: "password"
}, function(email, password, next) {
  User.findOne({
    email: email
  }, function (err, user ) {
    if (err) return next(err);
    if (user) return next({message: "User already exists"});
    let newUser = new User({
      email: email,
      passwordHash: bcrypt.hashSync(password, 10) // number represent the amount of security, higher number more secure but also slower
    })
    newUser.save(function (err) {
      next(err, newUser);
    });
  });
}));


passport.serializeUser(function(user,next){
  next(null, user._id);
});

passport.deserializeUser(function(id,next){
  User.findById(id, function(err, user) {
    next(err, user);
  });
});

//defining a request handler
app.get('/', function(req, res,next) {
   res.render('index', {title: "SaaS Tutorial"} )
})

app.get('/walkthrough', function (req, res, next) {
  req.session.sawWalkthrough = true;
  res.end();
})


app.get('/complicated', function (req, res, next) {
  console.log(req.session.sawWalkthrough);

})

app.get('/main', function(req, res,next) {
  res.render('main')
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login-page' }),
    function(req, res) {
      res.redirect('/main');
    });


app.get('/login-page', function (req, res){
   res.render('login-page')
})
//retrieving the data
app.post('/signup',
    passport.authenticate('signup-local', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/main');
    });

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
