const http = require('http');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const setUpPassport = require('./setuppassport');
const { PORT } = require('./utilities/const');

const index = require('./routes/index');
const search = require('./routes/search');
const detail = require('./routes/detail');
const login = require('./routes/login');
const logout = require('./routes/logout');
const register = require('./routes/register');
const user = require('./routes/user');
const password = require('./routes/password');
const category = require('./routes/category');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'a5717a649d346ed0c51be68888c130cd',
	resave: false,
	saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
setUpPassport();

app.use(function(req, res, next) {	
	res.locals.currentUser = req.user ? req.user: req.session.user;
	res.locals.errors = req.flash('error');
	res.locals.infos = req.flash('info');
	next();
});

app.use('/', index);
app.use('/search', search);
app.use('/detail', detail);
app.use('/login', login);
app.use('/logout', logout);
app.use('/register', register);
app.use('/user', user);
app.use('/password', password);
app.use('/category', category);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = err;

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

http.createServer(app).listen(PORT);