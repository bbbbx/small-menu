const express = require('express');
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcrypt');
const { User } = require('../models/index');
const router = express.Router();
const saltRounds = 10;

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	res.render('register', {captcha});
});

router.post('/', function(req, res) {
	const CAPTCHA = Math.floor(100000 + Math.random() * 899999);
	const { email, username, password, passwordConfirm } = req.body;

	if (password !== passwordConfirm) {
		req.flash('errors', '两次密码不一致');
		res.redirect('/register');
	}

	User.findOne({where: { username }})
		.then(user => {
			if (user) {
				req.flash('errors', '用户已存在');
				res.redirect('/register');
			} else {
				bcrypt.hash(password, saltRounds, (err, hash) => {
					User.create({ email, username, password: hash })
						.then(() => {
							User.find({ where: { username }})
								.then(user => {
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
										subject: '小当家注册验证',
										html: `<p>您的验证码为<b>${CAPTCHA}</b>，十分钟内有效，请不要泄漏他人。</p>`
									};
									
									transporter.sendMail(mailOption);
									res.locals.currentUser = user.dataValues;
									console.log(res.locals.currentUser);
									res.redirect('/');
								});
						});
					
				});
			}
		});
});

module.exports = router;