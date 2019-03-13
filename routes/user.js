const express = require('express');
const multer  = require('multer');
const qiniu = require('qiniu');
const path = require('path');

const router = express.Router();
const { User, Menu, Article } = require('../models/index');
const { PLEASE_LOGIN, GENDER_ERROR, UPDATE_SUCCESS, QINIU_DOMAIN } = require('../utilities/const');
const upload = multer({ 
	dest: 'uploads/',
	limits: {
		fileSize: 1024 * 1024
	}
});

router.get('/', async (req, res) => {
	res.locals.users = [];
	let users = await User.findAll();

	if (users.length === 0) {
		res.render('chart');
	} else {
		users.map(async (user, index) => {
			res.locals.users.push(user.dataValues);
			let followers = await user.getFollowers();
			let following = await user.getFollowing();

			res.locals.users[index].followers = followers.length;
			res.locals.users[index].following = following.length;

			if (index === users.length - 1) {
				res.render('chart');
			}
		});
	}
});

router.get('/setting', async (req, res) => {
	if (!req.session.user) {
		req.flash('error', PLEASE_LOGIN);
		res.redirect('/');
	} else {
		let user = await User.findById(parseInt(req.session.user.id))
		if (!user) {
			req.flash('error', PLEASE_LOGIN);
			res.redirect('/');
		} else {
			res.render('setting');
		}
	}
});

router.post('/setting', upload.single('avatar'), function(req, res) {
	const { username, gender, intro} = req.body;

	if (!req.session.user) {
		req.flash('error', PLEASE_LOGIN);
		res.redirect('/login');
	} else if (gender !== '男' && gender !== '女') {
		req.flash('error', GENDER_ERROR);
		res.redirect('/user/setting');
	} else if (typeof req.file === 'undefined') {
		const intGender = gender === '男' ? 1 : 0;
		User.update({
			username,
			gender: intGender,
			intro
		}, {
			where: { id: parseInt(req.session.user.id) }
		}).then(() => {
			User.findById(req.session.user.id).then(user => {
				req.session.user.username = user.dataValues.username;
				req.session.user.gender = user.dataValues.gender;
				req.session.user.intro = user.dataValues.intro;
				
				req.flash('info', UPDATE_SUCCESS);
				res.redirect('/user/0');
			});
		});
	} else {
		const intGender = gender === '男' ? 1 : 0;
		const mac = new qiniu.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);

		let config = new qiniu.conf.Config();
		config.zone = qiniu.zone.Zone_z2;
		
		const localFile = path.join(__dirname, '..', req.file.path);
		
		const formUploader = new qiniu.form_up.FormUploader(config);
		const putExtra = new qiniu.form_up.PutExtra();
		
		const keyToOverwrite = `avatar/${req.file.filename}.jpg`;
		const options = {
			scope: `${process.env.QINIU_BUCKET}:${keyToOverwrite}`
		};
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const uploadToken = putPolicy.uploadToken(mac);

		formUploader.putFile(uploadToken, keyToOverwrite, localFile, putExtra, (respErr, respBody, respInfo) => {
			if (respErr) {
				throw respErr;
			}
			if (respInfo.statusCode == 200) {
				User.update({
					username,
					gender: intGender,
					avatar: QINIU_DOMAIN + keyToOverwrite,
					intro
				}, {
					where: { id: parseInt(req.session.user.id) }
				}).then(() => {
					User.findById(req.session.user.id).then(user => {
						req.session.user.username = user.dataValues.username;
						req.session.user.gender = user.dataValues.gender;
						req.session.user.intro = user.dataValues.intro;
						req.session.user.avatar = user.dataValues.avatar;
						
						req.flash('info', UPDATE_SUCCESS);
						res.redirect('/user/0');
					});
				});
			} else {
				req.flash('info', UPDATE_SUCCESS);
				res.redirect('back');
			}
		});
	}
});

router.get('/0', function(req, res) {
	res.locals.followingDisabled = false;

	if (req.session.user) {
		req.session.user.following.map(value => {
			if (value.id === req.session.user.id) {
				res.locals.followingDisabled = true;
			}
		});
		res.locals.removeVisiable = true;

		res.render('user');

	} else {
		req.flash('error', '请先登录！');
		res.redirect('/login');
	}
});

router.get('/:id', async (req, res) => {
	const { id } = req.params;
	res.locals.followingDisabled = false;

	if (req.session.user) {
		req.session.user.following.map(value => {
			if (value.id === parseInt(id)) {
				res.locals.followingDisabled = true;
			}
		});
	}

	let user = await User.findById(id)
	if (!user) {
		req.flash('error', '用户不存在！');
		res.redirect('/user');
	} else {
		res.locals.currentUser = user.dataValues;
		res.locals.currentUser.following = [];
		res.locals.currentUser.followers = [];
		res.locals.currentUser.comments = [];
		res.locals.currentUser.collections = [];
		res.locals.currentUser.collectedArticles = [];
		res.locals.currentUser.articles = [];
		res.locals.currentUser.articleComments = [];

		let menus = await user.getMenus()
		menus.map((value, index) => {
			res.locals.currentUser.collections.push(menus[index]);
		});
		res.locals.removeVisiable = false;

		let followings = await user.getFollowing()
		followings.map((value) => {
			res.locals.currentUser.following.push(value);
		});
		let followers = await user.getFollowers()
		followers.map((value) => {
			res.locals.currentUser.followers.push(value);
		});

		let collectedArticles = await user.getArticles()
		collectedArticles.map(value => {
			res.locals.currentUser.collectedArticles.push(value.dataValues);
		});
		
		let articles = await Article.findAll({
							where: { userId: res.locals.currentUser.id}
		});
		articles.map(value => {
			res.locals.currentUser.articles.push(value.dataValues);
		});
							
		let articleComments = await user.getArticleComments();
		if (articleComments.length === 0) {
			let comments = await user.getComments();
			if (comments.length === 0) {
				res.render('user');
			} else {
				comments.map(async (comment, index) => {
					res.locals.currentUser.comments[index] = comment.dataValues;
					let menu = await Menu.findById(comment.menuId);
					res.locals.currentUser.comments[index].menu = menu.dataValues;
					if (index === comments.length - 1) {
						res.render('user');
					}
				});
			}
		} else {
			articleComments.map(async (articleComment, index) => {
				res.locals.currentUser.articleComments.push(articleComment.dataValues);
				let article = await Article.findById(articleComments[index].articleId)
				res.locals.currentUser.articleComments[index].article = article.dataValues;
				if (index === articleComments.length - 1) {
					let comments = await user.getComments();
					if (comments.length === 0) {
						res.render('user');
					} else {
						comments.map(async (comment, index) => {
							res.locals.currentUser.comments[index] = comment.dataValues;
							let menu = await Menu.findById(comments[index].menuId)
							res.locals.currentUser.comments[index].menu = menu.dataValues;
							if (index === comments.length - 1) {
								res.render('user');
							}
						});
					}
				}
			});
		}
	}
});

module.exports = router;