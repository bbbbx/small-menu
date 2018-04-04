const express = require('express');
const sgMail = require('@sendgrid/mail');
const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcrypt');
const { User, Captcha } = require('../models/index');
const router = express.Router();
const saltRounds = 10;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.locals.captcha = captcha;
	res.render('password');
});

router.post('/', function(req, res) {
	const { account, email, emailCaptcha, captcha, password, passwordConfirm } = req.body;
	const CAPTCHA = Math.floor(100000 + Math.random() * 899999);
	const SVGCaptcha = svgCaptcha.create();

	req.session.captcha = SVGCaptcha.text;
	res.locals.captcha = SVGCaptcha;

	if (captcha !== req.session.captcha) {
		req.flash('error', '验证码错误！注意区分大小写');
		res.redirect('/password');
	} else if (password !== passwordConfirm) {
		req.flash('error', '两次密码不一致！');
		res.redirect('/password');
	} else if (emailCaptcha === '' && captcha === req.session.captcha) {
		User.findOne({ where: { account, email }})
			.then(user => {
				if (user) {
					const msg = {
						to: email,
						from: '"小当家" <venus@venusworld.cn>',
						subject: '小当家找回密码',
						html: `<p>${user.dataValues.username}：</p><p>&nbsp;&nbsp;您的验证码为<b>${CAPTCHA}</b>，十分钟内有效，切勿泄漏他人。</p>`
					};
					
					sgMail.send(msg).then(() => {
						const timestamp = new Date().getTime();
						Captcha.create({
							timestamp,
							used: false,
							value: CAPTCHA,
							userId: user.dataValues.id
						})
							.then(() => {
								res.locals.infos = ['邮件已发送'];
								res.render('password', { account, email, password, passwordConfirm });
							});
					}).catch(error => {
						console.log(error);
						req.flash('error', '发送邮件失败');
						res.redirect('/password');
					});
				} else {
					req.flash('error', '用户不存在！');
					res.redirect('/password');
				}
			});
	} else {
		User.findOne({ where: { account, email }})
			.then(user => {
				if (!user) {
					req.flash('error', '用户不存在！');
					res.redirect('/password');
				} else {
					Captcha.findAll({
						where: { 
							userId: user.dataValues.id,
							used: false
						},
						order: [
							['timestamp', 'DESC']
						]
					})
						.then(captchas => {
							if (!captchas[0]) {
								req.flash('error', '请先获取邮箱验证码');
								res.redirect('/password');
							}
							if (captchas[0].dataValues.value === emailCaptcha) {
								const duration = new Date().getTime() - captchas[0].dataValues.timestamp;
								if (duration > 600000) {
									req.flash('error', '邮箱验证码超过十分钟，请重新发送。');
									res.redirect('/password');
								} else {
									Captcha.update({
										used: true
									}, {
										where: {
											id: captchas[0].dataValues.id
										}
									})
										.then(() => {
											bcrypt.hash(passwordConfirm, saltRounds, function(err, hash) {
												User.update({
													password: hash
												}, {
													where: {
														email,
														account
													}
												})
													.then(() => {
														req.flash('info', '重置密码成功，请重新登录。');
														res.redirect('/login');
													});
											});
										});
								}
							} else {
								req.flash('error', '邮箱验证码不正确');
								res.redirect('/password');
							}
						});
				}
			});
	}
});

module.exports = router;