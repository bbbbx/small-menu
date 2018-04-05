const express = require('express');
const multer  = require('multer');
const upload = multer();
const { User, Captcha, Menu, UserMenu, Comment, UserFollowing, UserFollowers } = require('../models/index');
const { PLEASE_LOGIN } = require('../utilities/const');
const router = express.Router();

router.get('/', function(req, res) {
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
				res.redirect('/');
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
						res.redirect('/');
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
								// req.session.user = user.dataValues;
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

	if (req.session.user) {
		User.findOne({where: { id: parseInt(userId)}})
			.then(user => {
				if (!user) {
					req.flash('error', '用户不存在！');
					res.redirect('/');
				}
				Menu.findOne({where: {id: parseInt(menuId)}})
					.then(menu => {
						if (!menu) {
							req.flash('error', '菜谱不存在！');
							res.redirect('/');
						}
						user.getMenus().then(menus => {
							menus.map((value, index) => {
								if (menuId === value.id) {
									req.flash('error', '已收藏！');
									res.redirect(`/detail/${menuId}`);
								}
								if (index == menus.length - 1) {
									user.addMenu(menu).then(() => {
										req.flash('info', '收藏成功');
										req.session.user.collections.push(menu);
										res.redirect(`/detail/${menuId}`);
									});
								}
							});
						});
					});
			});
	} else if (userId === '' || typeof userId === 'undefined' || menuId === '' || typeof menuId === 'undefined') {
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
				res.send('收藏不存在！');
				// res.redirect('/');
			} else {
				userMenu.destroy().then(() => {
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
		res.send(PLEASE_LOGIN);
	}
});

router.delete('/following', function(req, res) {
	const { followingId } = req.body;

	if (res.locals.currentUser) {
		UserFollowing.findOne({
			where: {
				userId: res.locals.currentUser.id,
				FollowingId: parseInt(followingId)
			}
		}).then(userFollowing => {
			if (!userFollowing) {
				res.send('用户不存在！');
			} else {
				userFollowing.destroy().then(() => {
					UserFollowers.findOne({
						where: {
							userId: parseInt(followingId),
							FollowerId: res.locals.currentUser.id
						}
					}).then(userFollowers => {
						userFollowers.destroy().then(() => {
							req.session.user.followers.map((value, index) => {
								if (value.id === res.locals.currentUser.id) {
									req.session.user.followers.splice(index, 1);
								}
							});
							req.session.user.following.map((value, index) => {
								if (value.id === parseInt(followingId)) {
									req.session.user.following.splice(index, 1);
								}
							});
							res.end();
						});
					});
					
				});
			}
		});
	} else {
		res.send(PLEASE_LOGIN);
	}
});

router.get('/usermenus', function(req, res) {
	res.end('get');
});

router.get('/following', function(req, res) {
	const { followingId } = req.query;
	if (!res.locals.currentUser) {
		req.flash('error', '请先登录！');
		res.redirect('/login');
	} else {
		User.findById(res.locals.currentUser.id).then(user => {
			if (!user) {
				req.flash('error', '请先登录！');
				res.redirect('/login');
			} else {
				User.findById(followingId).then(following => {
					user.addFollowing(following).then(() => {
						following.addFollowers(user).then(() => {

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
									req.flash('info', '关注成功');
									res.redirect(`/user/${followingId}`);
								});
							});
						});
					});
				});
			}
		});
	}
});

router.post('/comment', upload.array(), function(req, res) {
	const { commentContent, menuId } = req.body;
	if (!req.session.user) {
		req.flash('error', '请先登录！');
		res.redirect('/login');
	} else if (commentContent === '') {
		req.flash('error', '评论不能为空');
		res.redirect(`/detail/${menuId}`);
		// res.end();
	} else { 
		Comment.create({
			content: commentContent,
			userId: req.session.user.id,
			menuId
		}).then(comment => {
			if (comment) {
				req.flash('info', '发表成功');
				res.redirect(`/detail/${menuId}#commentForm`);
			} else {
				req.flash('error', '发表失败！');
				res.redirect(`/detail/${menuId}`);
			}
			
		});
	}
});

module.exports = router;