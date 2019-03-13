const express = require('express');
const multer = require('multer');
const qiniu = require('qiniu');
const path = require('path');
const { User, Article, ArticleComment } = require('../models/index');
const { PLEASE_LOGIN, QINIU_DOMAIN, POST_SUCCESS } = require('../utilities/const');

const router = express.Router();
const upload = multer({ 
	dest: 'uploads/'
});

router.post('/comment', upload.array(), async function (req, res) {
	const { articleId, commentContent } = req.body;
	console.log(commentContent);
	
	if (!req.session.user) {
		req.flash('error', PLEASE_LOGIN);
		res.redirect('/login');
	} else if (commentContent === '') {
		req.flash('error', '评论不能为空');
		res.redirect(`/article/${articleId}`);
	} else {
		let articleComment = await ArticleComment.create({
			userId: req.session.user.id,
			articleId: parseInt(articleId),
			content: commentContent
		});
		if (articleComment) {
			let article = await Article.findById(parseInt(articleId));
			if (article) {
				req.session.user.articleComments.push(articleComment.dataValues);
				req.session.user.articleComments[req.session.user.articleComments.length-1].article = article.dataValues;
				req.flash('info', '发表成功');
				res.redirect(`/article/${articleId}`);
			} else {
				req.flash('error', '发表失败！');
				res.redirect(`/article/${articleId}`);		
			}
		}
	}
});

/**
 * 获取所有文章
 */
router.get('/', function(req, res) {
	Article.findAll().then(articles => {
		res.locals.articles = [];
		articles.map(value => {
			res.locals.articles.push(value.dataValues);
		});
		res.render('article');
	});
	
});

/**
 * 发表文章编辑页面
 */
router.get('/0', function(req, res) {
	if (!req.session.user) {
		req.flash('error', PLEASE_LOGIN);
		res.redirect('/login');
	} else {
		res.render('postArticle');
	}
});

/**
 * 发表文章 POST 请求
 */
router.post('/', upload.array('album', 1), function(req, res) {
	const { title, tags, intro, content } = req.body;
	console.log(title, tags, intro, content);
	console.log(req.files);

	if (!req.session.user) {
		res.locals.errors = [PLEASE_LOGIN];
		res.redirect('/login');
	} else {
		const mac = new qiniu.auth.digest.Mac(process.env.QINIU_ACCESS_KEY, process.env.QINIU_SECRET_KEY);

		let config = new qiniu.conf.Config();
		config.zone = qiniu.zone.Zone_z2;
		
		const localFile = path.join(__dirname, '..', req.files[0].path);
		
		const formUploader = new qiniu.form_up.FormUploader(config);
		const putExtra = new qiniu.form_up.PutExtra();

		const extension = req.files[0].originalname.split('.')[req.files[0].originalname.split('.').length-1];
		
		const keyToOverwrite = `article/${req.files[0].filename}.${extension}`;
		const options = {
			scope: process.env.QINIU_BUCKET
		};
		const putPolicy = new qiniu.rs.PutPolicy(options);
		const uploadToken = putPolicy.uploadToken(mac);

		formUploader.putFile(uploadToken, keyToOverwrite, localFile, putExtra, (respErr, respBody, respInfo) => {
			if (respErr) {
				throw respErr;
			}
			if (respInfo.statusCode == 200) {
				console.log(respBody);

				Article.create({
					title,
					album: QINIU_DOMAIN + keyToOverwrite,
					tags,
					intro,
					content,
					userId: parseInt(req.session.user.id)
				}).then(article => {
					req.session.user.articles.push(article.dataValues);
					req.flash('info', POST_SUCCESS);
					res.redirect('/article');
				});
			} else {
				console.log(respInfo.statusCode);
				console.log(respBody);
			}
		});

	}
	
});

router.get('/collect', async (req, res) => {
	const { articleId } = req.query;

	if (!req.session.user) {
		req.flash('error', PLEASE_LOGIN);
		res.redirect('/login');
	} else {
		let article = await Article.findById(parseInt(articleId));
		if (!article) {
			req.flash('error', '文章不存在！');
			res.redirect('/article');
		} else {
			let user = await User.findById(req.session.user.id)
			let collectedArticles = await user.getArticles();
			if (collectedArticles.length === 0) {
				await user.addArticle(article)
				req.session.user.collectedArticles.push(article.dataValues);
				req.flash('info', '收藏成功');
				res.redirect(`/article/${articleId}`);
			}
			collectedArticles.forEach(async (value, index) => {
				if (value.dataValues.id === parseInt(articleId)) {
					req.flash('error', '已收藏！');
					res.redirect('/article');
				}
				if (index === collectedArticles.length-1) {
					await user.addArticle(article);
					req.session.user.collectedArticles.push(article.dataValues);
					req.flash('info', '收藏成功');
					res.redirect(`/article/${articleId}`);
				}
			});
		}
	}
});

/**
 * 获取文章详情
 */
router.get('/:id', async (req, res) => {
	const { id } = req.params;

	res.locals.collectDisabled = false;
	
	if (req.session.user) {
		req.session.user.collectedArticles.map(value => {
			if (value.id === parseInt(id)) {
				res.locals.collectDisabled = true;
			}
		});
	}

	let article = await Article.findById(parseInt(id));
	if (!article) {
		req.flash('error', '文章不存在！');
		res.redirect('/article');
	} else {
		let user = await User.findById(article.userId);
		res.locals.poster = {};
		if (!user) {
			let articleComments = await article.getArticleComments();
			res.locals.comments = [];
			if (articleComments.length === 0) {
				res.render('articleDetail', { article: article.dataValues });
			} else{
				console.log(article.intro);
				articleComments.map(async (articleComment, index) => {
					res.locals.comments[index] = articleComment.dataValues;
					let user = await User.findById(articleComment.userId);
					res.locals.comments[index].user = user.dataValues;
					if (index === articleComments.length - 1) {
						res.render('articleDetail', { article: article.dataValues });
					}
				});
			}
		} else {
			res.locals.poster = user.dataValues;
			let articleComments = await article.getArticleComments();
			res.locals.comments = [];
			if (articleComments.length === 0) {
				res.render('articleDetail', { article: article.dataValues });
			} else{
				console.log(article.intro);
				articleComments.map(async (articleComment, index) => {
					res.locals.comments[index] = articleComment.dataValues;
					let user = await User.findById(articleComment.userId);
					res.locals.comments[index].user = user.dataValues;
					if (index === articleComments.length - 1) {
						res.render('articleDetail', { article: article.dataValues });
					}
				});
			}
		}
	}
});


module.exports = router;