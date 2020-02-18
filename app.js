require('dotenv').config();
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const flash = require('connect-flash');
const hbs = require('hbs');

const userLocals = require('./configs/user-locals');

const app = express();

require('./configs/db.config');
require('./routes/socket/socket.io');
require('./configs/passport.config')(app);
app.use(userLocals);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
hbs.registerPartials(__dirname + '/views/partials');

// Routes
// - Make sure when you're in routes not to include the routes end point
// - But when you're redirecting to route or in the hbs view include the routes end point
app.use('/', require('./routes/welcome-page'));
app.use('/auth', require('./routes/auth-routes/auth'));
app.use('/profile', require('./routes/user-routes/profile'));
app.use('/posts', require('./routes/user-routes/posts'));
app.use('/comments', require('./routes/user-routes/comments'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
