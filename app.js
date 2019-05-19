var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var helmet = require('helmet');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var postsRouter = require('./routes/posts');
var threadRouter = require('./routes/threads');
var logoutRouter = require('./routes/logout');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  name : 'forum-cookie',
  cookie : {
    httpOnly: false,
    secure: false,
    maxAge: 1000 * 60 * 30 // 30min
  }
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/threads', threadRouter);
app.use('/thread/:threadId', postsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {

    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      user: req.session.user
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {

  console.log(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.render('error', {
      message: '選択したファイルのサイズが大きすぎます。',
      error: {},
      user: req.session.user
    });  
  } else {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      user: req.session.user
    });
  }

});


module.exports = app;
