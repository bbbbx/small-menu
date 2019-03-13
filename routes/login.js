const express = require('express');
const bcrypt = require('bcrypt');
const svgCaptcha = require('svg-captcha');
const { User, Article, Menu, ArticleComment, Comment } = require('../models/index');
const router = express.Router();

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.locals.account = req.session.account;
	delete req.session.account;
	res.locals.captcha = captcha;
	res.app.locals.Referer = req.get('Referer');
	res.render('login');
});

router.post('/', function(req, res) {
	const { account, password, captcha } = req.body;
	if (captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
		req.flash('error', '验证码错误！');
		res.redirect('back');
	} else {
		User.findOne({
			where: { account },
			include: [
				Article,
				ArticleComment,
				Menu,
				Comment
			]
		}).then(user => {
			if (!user) {
				req.flash('error', '用户不存在!');
				res.redirect('back');
			} else if (user.confirmed) {
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) {
						req.flash('error', err);
						res.redirect('back');
					} else if (isMatch) {
						req.session.user = user.dataValues;
						req.session.user.following = [];
						req.session.user.followers = [];
						req.session.user.collections = user.dataValues.menus;
						req.session.user.collectedArticles = user.dataValues.articles;
						req.session.user.articles = [];
						req.session.user.articleComments = user.dataValues.articleComments;
						req.session.user.comments = user.dataValues.comments;

						let followings = user.getFollowing();
						let followers = user.getFollowers();
						let articles = Article.findAll({
							where: { userId: req.session.user.id}
						});
						Promise.all([followings, followers, articles])
							.then(([followings, followers, articles]) => {
								followings.map(value => {
									req.session.user.following.push(value.dataValues);
								});
								followers.map(value => {
									req.session.user.followers.push(value.dataValues);
								});
								articles.map(value => {
									req.session.user.articles.push(value.dataValues);
								});
								res.redirect(res.app.locals.Referer);  // res.app.locals.Referer 为在 GET /user 时存储的 `req.get('Referer')`
							});
					} else {
						req.flash('error', '密码错误！');	
						req.session.account = account;
						res.redirect('back');
					}
				});
			} else {
				req.flash('error', '请先验证注册邮箱！');	
				req.session.account = account;
				res.redirect('back');
			}
		});
		
	}
});

module.exports = router;