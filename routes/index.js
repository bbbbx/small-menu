const express = require('express');
const { User, Captcha, Menu, UserMenu } = require('../models/index');
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
						Captcha.update({
							used: true
						}, {
							where: {
								id: captcha.id
							}
						}).then(() => {
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

router.delete('/usermenus', function(req, res) {
	const { menuId } = req.body;

	if (res.locals.currentUser) {
		UserMenu.findOne({
			where: { 
				userId: res.locals.currentUser.id,
				menuId: parseInt(menuId)
			}
		}).then(userMenu => {
			if (!userMenu) {
				req.flash('error', '收藏不存在！');
				res.send('收藏不存在！');
				// res.redirect('/');
			} else {
				userMenu.destroy().then(userMenu => {
					// req.flash('info', '移除成功');
					res.end();
					// res.redirect(200, '/user');
				});
				// req.flash('info', '移除成功');
				// res.redirect(200, '/user');
				// router.get('/user');
				// res.locals.infos = ['移除成功'];
				// res.render('user');
			}
		});
	} else {
		// req.flash('error', '请先登录！');
		// res.redirect('/login');
		res.send('请先登录！');
	}
});

router.get('/usermenus', function(req, res) {
	res.end('get');
});

module.exports = router;