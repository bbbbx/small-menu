const express = require('express');
const { User, Captcha, Menu } = require('../models/index');
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

router.get('/collect', function(req, res) {
	const { userId, menuId } = req.query;
	if (req.session.user || req.isAuthenticated()) {
		User.findOne({where: { id: userId}})
			.then(user => {
				if (!user) {
					req.flash('error', '用户不存在！');
					res.redirect('/');
				}
				Menu.findOne({where: {id: menuId}})
					.then(menu => {
						if (!menu) {
							req.flash('error', '菜谱不存在！');
							res.redirect('/');
						}
						user.addMenu(menu);
						req.flash('info', '收藏成功');
						res.redirect(`/detail/${menuId}`);
					});
			});
	} else if (userId === '' || typeof userId === 'undefined' || 
			menuId === '' || typeof menuId === 'undefined') {
		req.flash('error', '参数错误！');
		res.redirect('/');
	} else {
		req.flash('error', '请先登录后，再收藏！');
		res.redirect('/login');
	}
});

module.exports = router;