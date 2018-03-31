const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/index');
const router = express.Router();

router.get('/', function(req, res) {
	res.render('login');
});

router.post('/', function(req, res) {
	const { account, password } = req.body;
	User.findOne({ where: { account }})
		.then(user => {
			if (!user) {
				req.flash('error', '用户不存在!');
				res.redirect('/login');
			}
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if (err) {
					req.flash('error', err);
					res.redirect('/login');
				}
				if (isMatch) {
					req.session.user = user.dataValues;
					req.session.user.following = [];
					req.session.user.followers = [];
					user.getFollowing().then(followings => {
						followings.map((value) => {
							req.session.user.following.push(value);
						});
						user.getFollowers().then(followers => {
							followers.map((value) => {
								req.session.user.followers.push(value);
							});
							res.redirect('/');
						});
					});
				} else {
					req.flash('error', '密码错误！');
					res.redirect('/login');
				}
			});
		});
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