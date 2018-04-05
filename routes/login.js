const express = require('express');
const bcrypt = require('bcrypt');
const svgCaptcha = require('svg-captcha');
const { User } = require('../models/index');
const router = express.Router();

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.locals.account = req.session.account;
	delete req.session.account;
	res.locals.captcha = captcha;
	res.render('login');
});

router.post('/', function(req, res) {
	const { account, password, captcha } = req.body;
	if (captcha !== req.session.captcha) {
		req.flash('error', '验证码错误！');
		res.redirect('/login');
	} else {
		User.findOne({ where: { account }})
			.then(user => {
				if (!user) {
					req.flash('error', '用户不存在!');
					res.redirect('/login');
				} else if (user.confirmed) {
					bcrypt.compare(password, user.password, (err, isMatch) => {
						if (err) {
							req.flash('error', err);
							res.redirect('/login');
						} else if (isMatch) {
							req.session.user = user.dataValues;
							req.session.user.following = [];
							req.session.user.followers = [];
							req.session.user.collections = [];

							user.getFollowing().then(followings => {
								followings.map(value => {
									req.session.user.following.push(value.dataValues);
								});
								user.getFollowers().then(followers => {
									followers.map(value => {
										req.session.user.followers.push(value.dataValues);
									});
									user.getMenus().then(menus => {
										menus.map(value => {
											req.session.user.collections.push(value.dataValues);
										});
										console.log(req.session.user);
										res.redirect('/');
									});
								});
							});
						} else {
							req.flash('error', '密码错误！');	
							req.session.account = account;
							res.redirect('/login');
						}
					});
				} else {
					req.flash('error', '请先验证注册邮箱！');	
					req.session.account = account;
					res.redirect('/login');
				}
			});
		
	}
	// User.findById(res.locals.currentUser.id).then(user => {
	// 	req.session.user.following = user.getFollowing();
	// 	req.flash('info', '登录成功');
	// 	res.redirect('/');
	// });
});

// router.post('/', passport.authenticate('login', {
// 	// successRedirect: '/',
// 	failureRedirect: '/login',
// 	failureFlash: true
// }), function(req, res) {
// 	User.findById(res.locals.currentUser.id).then(user => {
// 		req.session.user.following = user.getFollowing();
// 		req.flash('info', '登录成功');
// 		res.redirect('/');
// 	});
// });

// router.post('/', function(req, res) {
// 	const { username, password } = req.body;
// 	if (typeof username === 'undefined' || username === null
// 		|| typeof password === 'undefined' || password === null) {
// 		req.flash('errors', '用户名或密码不能为空');
// 		res.redirect('/login');
// 	}
	
// 	User.findOne({where: { username }})
// 		.then(user => {
// 			if (user) {
// 				bcrypt.compare(password, user.password, (err, result) => {
// 					if (result) {
// 						res.app.locals.username = username;
// 						res.app.locals.passowrd = user.password;
// 						res.redirect('/');
// 					}
// 				});
// 			} else {
// 				req.flash('errors', '用户不存在');
// 				res.redirect('/login');
// 			}
// 		});
// });

module.exports = router;