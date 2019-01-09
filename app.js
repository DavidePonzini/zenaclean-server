var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reportsRouter = require('./routes/reports');

var users2=require('./routes/users2');
var reports2 = require('./routes/reports2');

var cors = require('cors');


var app = express();
app.use(cors({origin: ["http://localhost:4200"], credentials: true}));
const session = require('express-session');
app.use(session({
    secret: 'zenauth',
    resave: true, 
    saveUninitialized: true,
    rolling: true,
    cookie: {
      	httpOnly: false, 
	secure: false
    }
}));


app.use(express.static('/home/zenaclean/zenaclean-server/dist/ADoSS/'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/reports', reportsRouter);
app.use('/users2', users2);
app.use('/reports2', reports2);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.redirect("/");
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
