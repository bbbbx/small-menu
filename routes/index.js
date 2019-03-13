const express = require('express');
const nodejieba = require('nodejieba');
const multer  = require('multer');
const upload = multer();
const { User, Captcha, Menu, UserMenu, Comment, UserFollowing, UserFollowers, UserArticle } = require('../models/index');
const { PLEASE_LOGIN } = require('../utilities/const');
const router = express.Router();

router.get('/', function(req, res) {
	if (req.session.user) {
		res.locals.currentUser = req.session.user;
	}
	let titles = '';
	for (let i = 0; i < res.locals.menuHistory.length; i++) {
		titles += res.locals.menuHistory[i].title;
	}
	res.locals.recommandWords = nodejieba.extract(titles, 3);
	res.locals.recommandWords.forEach(value => {
		value.weight = value.weight.toFixed(1);
	});

	res.render('index');
});

router.get('/random', async (req, res) => {
	let menus = await Menu.findAll();
	if (menus.length === 0) {
		req.flash('error', '暂时没有菜谱');
		res.redirect('/');
	} else {
		const id = Math.ceil(Math.random() * menus.length);
		res.redirect(`/detail/${menus[id].id}`);
	}
});

router.get('/confirmEmail', async (req, res) => {
	const { captcha, email, account } = req.query;
	let user = await User.findOne({ where: { email, account, confirmed: false }});
	if (!user) {
		req.flash('error', '用户不存在');
		res.redirect('/');
	} else {
		let captcha = await Captcha.findOne({
			where: { 
				userId: user.dataValues.id, 
				used: false, 
				value: captcha
			}
		});
		if (!captcha) {
			req.flash('error', '邮件验证码不存在！');
			res.redirect('/');
		} else {
			await Captcha.update({
				used: true
			}, {
				where: {
					id: captcha.id
				}
			});
			await User.update({
				confirmed: true
			}, { 
				where: { 
					email,
					account 
				}
			})
			// req.session.user = user.dataValues;
			req.flash('info', '邮箱验证成功');
			res.redirect('/');
		}
	}
});

router.get('/collect', async (req, res) => {
	const { userId, menuId } = req.query;

	if (req.session.user) {
		let user = await User.findById(parseInt(userId));
		if (!user) {
			req.flash('error', '用户不存在！');
			res.redirect('/');
		} else {
			let menus = await user.getMenus()
			for ( let i = 0; i < menus.length; i++) {
				if (parseInt(menuId) === menus[i].id) {
					req.flash('error', '已收藏！');
					res.redirect(`/detail/${menuId}`);
				}
			}
			let menu = await Menu.findById(parseInt(menuId));
			if (!menu) {
				req.flash('error', '菜谱不存在！');
				res.redirect('/');
			} else {
				await user.addMenu(menu);
				req.flash('info', '收藏成功');
				req.session.user.collections.push(menu);
				res.redirect(`/detail/${menuId}`);
			}
		}
	} else if (userId === '' || typeof userId === 'undefined' || menuId === '' || typeof menuId === 'undefined') {
		req.flash('error', '参数错误！');
		res.redirect('/');
	} else {
		req.flash('error', '请先登录后，再收藏！');
		res.redirect('/login');
	}
});

router.delete('/usermenus', async (req, res) => {
	const { menuId } = req.body;

	if (res.locals.currentUser) {
		let userMenu = await UserMenu.findOne({
			where: { 
				userId: res.locals.currentUser.id,
				menuId: parseInt(menuId)
			}
		});
		if (!userMenu) {
			res.send('收藏不存在！');
		} else {
			await userMenu.destroy();

			req.session.user.collections.map((value, index) => {
				if (parseInt(menuId) === value.id) {
					req.session.user.collections.splice(index, 1);
				}
			});
			res.end();
		}
	} else {
		res.send(PLEASE_LOGIN);
	}
});

router.delete('/userarticle', async (req, res) => {
	const { articleId } = req.body;

	if (res.locals.currentUser) {
		let userArticle = await UserArticle.findOne({
			where: { 
				userId: res.locals.currentUser.id,
				articleId: parseInt(articleId)
			}
		});
		if (!userArticle) {
			res.send('收藏不存在！');
		} else {
			await userArticle.destroy()
				
			req.session.user.collectedArticles.map((value, index) => {
				if (parseInt(articleId) === value.id) {
					req.session.user.collectedArticles.splice(index, 1);
				}
			});
			res.end();
		}
	} else {
		res.send(PLEASE_LOGIN);
	}
});

router.delete('/following', async (req, res) => {
	const { followingId } = req.body;

	if (res.locals.currentUser) {
		let userFollowing = await UserFollowing.findOne({
			where: {
				userId: res.locals.currentUser.id,
				FollowingId: parseInt(followingId)
			}
		});
		if (!userFollowing) {
			res.send('用户不存在！');
		} else {
			await userFollowing.destroy();
			let userFollowers = await UserFollowers.findOne({
				where: {
					userId: parseInt(followingId),
					FollowerId: res.locals.currentUser.id
				}
			});
			await userFollowers.destroy()
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
		}
	} else {
		res.send(PLEASE_LOGIN);
	}
});

router.get('/usermenus', function(req, res) {
	res.end('get');
});

router.get('/following', async(req, res) => {
	const { followingId } = req.query;
	if (!res.locals.currentUser) {
		req.flash('error', '请先登录！');
		res.redirect('/login');
	} else {
		let user = await User.findById(res.locals.currentUser.id);
		if (!user) {
			req.flash('error', '请先登录！');
			res.redirect('/login');
		} else {
			let following = await User.findById(followingId);
			await user.addFollowing(following);
			await following.addFollowers(user);

			req.session.user.following = [];
			req.session.user.followers = [];
			let followings = await user.getFollowing();
			followings.map((value) => {
				req.session.user.following.push(value);
			});
			let followers = await user.getFollowers();
			followers.map((value) => {
				req.session.user.followers.push(value);
			});
			req.flash('info', '关注成功');
			res.redirect(`/user/${followingId}`);
		}
	}
});

router.post('/comment', upload.array(), async (req, res) => {
	const { commentContent, menuId } = req.body;
	if (!req.session.user) {
		req.flash('error', '请先登录！');
		res.redirect('/login');
	} else if (commentContent === '') {
		req.flash('error', '评论不能为空');
		res.redirect(`/detail/${menuId}`);
	} else { 
		let comment = await Comment.create({
			content: commentContent,
			userId: req.session.user.id,
			menuId
		});
		if (comment) {
			req.session.user.comments.push(comment.dataValues);
			let menu = await Menu.findById(req.session.user.comments[req.session.user.comments.length-1].menuId);
			req.session.user.comments[req.session.user.comments.length-1].menu = menu.dataValues;
			req.flash('info', '发表成功');
			res.redirect(`/detail/${menuId}#commentForm`);
		} else {
			req.flash('error', '发表失败！');
			res.redirect(`/detail/${menuId}`);
		}
	}
});


module.exports = router;