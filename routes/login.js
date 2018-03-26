const express = require('express');
const { User } = require('../models/index');
const router = express.Router();

router.use(function(req, res, next) {	
	res.locals.errors = req.flash('errors');
	next();
});

router.get('/', function(req, res) {
	res.render('login');
});

router.post('/', function(req, res, next) {
	const { username, password } = req.body;
	if (typeof username === 'undefined' || username === null
		|| typeof password === 'undefined' || password === null) {
		next();
		return res;
	}
	User.findOne({where: { username }})
		.then(user => {
			if (user) {
				res.app.locals.username = username;
				res.app.locals.password = password;
				res.redirect('/');
			} else {
				req.flash('errors', '用户不存在');
				res.redirect('/login');
			}
		});
});

module.exports = router;