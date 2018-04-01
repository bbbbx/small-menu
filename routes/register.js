const express = require('express');
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcrypt');
const { User, Captcha } = require('../models/index');
const { AVATAR_BOY, AVATAR_GIRL, EMAIL_ACCOUNT, EMAIL_PASS, PORT, CLOUD_HOSTNAME } = require('../utilities/const');
const router = express.Router();
const saltRounds = 10;

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.render('register', {captcha});
});

router.post('/', function(req, res) {
	const { email, account, password, passwordConfirm, gender, captcha } = req.body;
	if (captcha !== req.session.captcha) {
		req.flash('error', '验证码错误！注意区分大小写');
		res.redirect('/register');
	} else if (password !== passwordConfirm) {
		req.flash('error', '两次密码不一致');
		res.redirect('/register');
	} else if (gender !== '男' && gender !== '女') {
		req.flash('error', '性别有误！');
		res.redirect('/register');
	} else {
		const CAPTCHA = Math.floor(100000 + Math.random() * 899999);

		User.findOne({where: { account }})
			.then(user => {
				if (user) {
					req.flash('error', '用户已存在');
					res.redirect('/register');
				} else {
					bcrypt.hash(password, saltRounds, (err, hash) => {
						const avatar = gender === '男' ? AVATAR_BOY : AVATAR_GIRL;
						const intGender = gender === '男' ? 1 : 0;

						User.create({ 
							email, 
							account, 
							username: account, 
							password: hash,
							avatar,
							gender: intGender
						})
							.then(() => {
								User.find({ where: { account }})
									.then(user => {
										let transporter = nodemailer.createTransport({
											host: 'smtp.163.com',
											port: 465,
											secure: true,
											auth: {
												user: EMAIL_ACCOUNT,
												pass: EMAIL_PASS
											}
										});
									
										const mailOption = {
											from: `"小当家" <${EMAIL_ACCOUNT}>`,
											to: email,
											subject: '小当家注册验证',
											html: `<p>${user.dataValues.username}：</p><p>&nbsp;&nbsp;请点击以下链接完成邮箱验证：</p><p><a href="${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}">${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}</a></p><p>如果以上链接无法点击，请将上面的地址复制到你的浏览器地址栏。</p>`
										};
										
										const timestamp = new Date().getTime();
										Captcha.create({
											timestamp,
											used: false,
											value: CAPTCHA,
											userId: user.dataValues.id
										});
										
										transporter.sendMail(mailOption, (err) => {
											if (err) {
												console.log(err);
											} else {
												// [TODO] 验证用户
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
														req.flash('info', '注册成功，请验证邮箱。');
														res.redirect('/');
													});
												});
											}
										});
									});
							});
						
					});
				}
			});
	}

});

module.exports = router;