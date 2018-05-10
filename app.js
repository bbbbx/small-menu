require('dotenv').load();
const http = require('http');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const axios = require('axios');
const cool = require('cool-ascii-faces');
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
const menu = require('./routes/menu');
const article = require('./routes/article');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);    // 设置反向代理

app.use(express.static(path.join(__dirname, 'public')));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: 'a5717a649d346ed0c51be68888c130cd',
	resave: true,
	saveUninitialized: true,
	// cookie: {
	// 	maxAge: 1000 * 60 * 60 * 24 * 14	// 14 天
	// }
}));
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());
// setUpPassport();

/**
 * 存储 req.session 为 res.locals
 */
app.use(function(req, res, next) {
	res.locals.menuHistory = req.session.menuHistory ? req.session.menuHistory: [];
	res.locals.recommandWords = [];
	res.locals.currentUser = req.session.user;
	res.locals.navAvatar = req.session.user ? req.session.user.avatar: false;
	res.locals.navUsername = req.session.user ? req.session.user.username: false;
	res.locals.errors = req.flash('error');
	res.locals.infos = req.flash('info');
	next();
});

/**
 * 转换 IP 地址为真实地址，获取时间
 */
app.use(function(req, res, next) {
	axios({
		method: 'get',
		url: `http://ip.taobao.com/service/getIpInfo.php?ip=${req.ip}`,
		responseType: 'json',
		timeout: 10000,
	}).then(response => {
		const date = new Date();
		res.locals.date = date;
		const random = Math.floor(Math.random() * 100);
		if (date.getHours() < 1) {
			res.locals.recommand = `${cool()} 夜深了，要吃点夜宵吗？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		} else if (date.getHours() >= 1 && date.getHours() <= 5) {
			res.locals.recommand = `${cool()} 这么晚了，还不睡？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		} else if (date.getHours() <= 10) {
			res.locals.recommand = `${cool()} 早上好，没吃早餐吧。`;
			res.locals.recommandUrl = `/category/37/${random}`;
		} else if (date.getHours() <= 14) {
			res.locals.recommand = `${cool()} 中午好，吃午餐了吗？`;
			res.locals.recommandUrl = `/category/38/${random}`;
		} else if (date.getHours() <= 16) {
			res.locals.recommand = `${cool()} 下午好，要喝点下午茶吗？`;
			res.locals.recommandUrl = `/category/39/${random}`;
		} else if (date.getHours() <= 21) {
			res.locals.recommand = `${cool()} 晚上好，吃晚餐了吗？`;
			res.locals.recommandUrl = `/category/40/${random}`;
		} else {
			res.locals.recommand = `${cool()} 夜深了，要吃点夜宵吗？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		}
		if (response.data.code === 0) {
			const { ip, country, city, area, region } = response.data.data;
	
			res.locals.ip = ip;
			res.locals.country = country;
			res.locals.area = area;
			res.locals.region = region;
			res.locals.city = city;

			const region2cid = {
				四川: 10,
				广东: 11,
				湖南: 12,
				山东: 13,
				北京: 14,
				东北: 15,
				黑龙江: 15,
				辽宁: 15,
				吉林: 15,
				日本: 17,
				美国: 16,
				韩国: 18,
				福建: 101,
				浙江: 102,
				江苏: 104,
				安徽: 105,
				河南: 107,
				河北: 107,
				山西: 108,
				江西: 109,
				湖北: 110,
				云南: 112,
				贵州: 113,
				新疆: 114,
				香港: 118,
				台湾: 119,
				海南: 126,
				上海: 115,
			};

			res.locals.cid = typeof region2cid[region] === 'undefined' ? 'notfound': region2cid[region];
	
			next();
		} else {
			res.locals.ip = '获取失败';
			res.locals.country = '获取失败';
			res.locals.city = '获取失败';
			res.locals.area = '获取失败';
			res.locals.region = '获取失败';
			next();
		}
	}).catch(err => {
		const date = new Date();
		res.locals.date = date;
		const random = Math.floor(Math.random() * 100);
		if (date.getHours() < 1) {
			res.locals.recommand = `${cool()} 夜深了，要吃点夜宵吗？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		} else if (date.getHours() >= 1 && date.getHours() <= 5) {
			res.locals.recommand = `${cool()} 这么晚了，还不睡？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		} else if (date.getHours() <= 10) {
			res.locals.recommand = `${cool()} 早上好，没吃早餐吧。`;
			res.locals.recommandUrl = `/category/37/${random}`;
		} else if (date.getHours() <= 14) {
			res.locals.recommand = `${cool()} 中午好，吃午餐了吗？`;
			res.locals.recommandUrl = `/category/38/${random}`;
		} else if (date.getHours() <= 16) {
			res.locals.recommand = `${cool()} 下午好，要喝点下午茶吗？`;
			res.locals.recommandUrl = `/category/39/${random}`;
		} else if (date.getHours() <= 21) {
			res.locals.recommand = `${cool()} 晚上好，吃晚餐了吗？`;
			res.locals.recommandUrl = `/category/40/${random}`;
		} else {
			res.locals.recommand = `${cool()} 夜深了，要吃点夜宵吗？`;
			res.locals.recommandUrl = `/category/41/${random}`;
		}
		res.locals.ip =
		res.locals.country =
		res.locals.city = 
		res.locals.area = 
		res.locals.region = false;
		next();
	});
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
app.use('/menu', menu);
app.use('/article', article);


// catch 404
app.use(function(req, res) {
	var err = new Error('Not Found');
	err.status = 404;

	res.locals.message = err.message;
	res.locals.error = err;

	res.status(err.status || 500);
	res.render('error');
});

http.createServer(app).listen(PORT, '0.0.0.0');