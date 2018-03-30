const express = require('express');
const { User, Captcha } = require('../models/index');
const router = express.Router();

router.get('/', function(req, res) {
	// if (req.isAuthenticated()) {
	// 	res.render('index', { currentUser: req.user });
	// } else {
	// 	res.render('index');
	// }
	if (req.session.user) {
		res.locals.currentUser = req.session.user;
	}
	res.render('index');
});

router.get('/confirmEmail', function(req, res) {
	const { captcha, email, account } = req.query;
	User.findOne({ where: { email, account, confirmed: false }})
		.then(user => {
			if (!user) {
				req.flash('error', '用户不存在');
				res.redirect('/register');
			} else {
				Captcha.findOne({
					where: { 
						userId: user.dataValues.id, 
						used: false, 
						value: captcha
					}
				}).then(captcha => {
					if (!captcha) {
						req.flash('error', '邮件验证码不存在！');
						res.redirect('/register');
					} else {
						User.update({
							confirmed: true
						}, { 
							where: { 
								email,
								account 
							}
						}).then(() => {
							req.session.user = user.dataValues;
							req.flash('info', '邮箱验证成功');
							res.redirect('/');
						});
					}
				});
			}
		});
});

module.exports = router;