const express = require('express');
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha');
const { User, Captcha } = require('../models/index');
const router = express.Router();

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

	if (captcha !== req.session.captcha) {
		req.flash('error', '验证码错误！注意区分大小写');
		res.redirect('/password');
	}
	if (password !== passwordConfirm) {
		req.flash('error', '两次密码不一致！');
		res.redirect('/password');
	}

	req.session.captcha = SVGCaptcha.text;
	res.locals.captcha = SVGCaptcha;

	console.log(emailCaptcha === '');
	if (emailCaptcha === '') {
		User.findOne({ where: { account, email }})
			.then(user => {
				if (user) {
					let transporter = nodemailer.createTransport({
						host: 'smtp.163.com',
						port: 465,
						secure: true,
						auth: {
							user: 'venus_box@163.com',
							pass: 'venus123'
						}
					});
				
					const mailOption = {
						from: '"小当家" <venus_box@163.com>',
						to: email,
						subject: '小当家找回密码',
						html: `<p>${user.dataValues.username}：</p><p>&nbsp;&nbsp;您的验证码为<b>${CAPTCHA}</b>，十分钟内有效，切勿泄漏他人。</p>`
					};
					
					transporter.sendMail(mailOption, (err) => {
						if (err) {
							req.flash('error', '发送邮件失败');
							res.redirect('/password');
						}
						const timestamp = new Date().getTime();
						Captcha.create({
							timestamp,
							used: false,
							value: CAPTCHA,
							userId: user.dataValues.id
						})
							.then(() => {
								req.flash('info', '邮件已发送');
								// res.render('password', { account, email, password, passwordConfirm });
								res.redirect('/password');
							});
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
					res.render('password');
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
								res.render('password');
							}
							if (captchas[0].dataValues.value === emailCaptcha) {
								const duration = new Date().getTime() - captchas[0].dataValues.timestamp;
								if (duration > 600000) {
									req.flash('error', '邮箱验证码超过十分钟，请重新发送。');
									res.render('password');	
								}
								req.flash('info', '重置密码成功，请重新登录。');
								res.redirect('/login');
							} else {
								req.flash('error', '邮箱验证码不正确');
								res.render('password');
							}
						});
				}
			});
	}
});

module.exports = router;