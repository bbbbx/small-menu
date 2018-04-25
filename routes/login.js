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
	if (captcha !== req.session.captcha) {
		req.flash('error', '验证码错误！');
		res.redirect('/login');
	} else {
		User.findOne({
			where: { account },
			include: [
				Article,
				ArticleComment,
				Menu,
				Comment
			]
		})
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
							console.log(user.dataValues);
							req.session.user = user.dataValues;
							req.session.user.following = [];
							req.session.user.followers = [];
							req.session.user.collections = user.dataValues.menus;
							req.session.user.collectedArticles = user.dataValues.articles;
							req.session.user.articles = [];
							req.session.user.articleComments = user.dataValues.articleComments;
							req.session.user.comments = user.dataValues.comments;

							user.getFollowing().then(followings => {
								followings.map(value => {
									req.session.user.following.push(value.dataValues);
								});
								user.getFollowers().then(followers => {
									followers.map(value => {
										req.session.user.followers.push(value.dataValues);
									});
									Article.findAll({
										where: { userId: req.session.user.id}
									}).then(articles => {
										articles.map(value => {
											req.session.user.articles.push(value.dataValues);
										});
										console.log(req.session.user);
										res.redirect(res.app.locals.Referer);
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
});

module.exports = router;