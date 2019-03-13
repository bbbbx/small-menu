const express = require('express');
const sgMail = require('@sendgrid/mail');
const svgCaptcha = require('svg-captcha');
const bcrypt = require('bcrypt');
const { User, Captcha } = require('../models/index');
const { AVATAR_BOY, AVATAR_GIRL, PORT, CLOUD_HOSTNAME } = require('../utilities/const');
const router = express.Router();
const saltRounds = 10;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', function(req, res) {
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.render('register', {captcha});
});

router.post('/', async (req, res) => {
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
	} else if (! (/^[a-zA-Z0-9]{5,16}$/.test(account)) ) {
		req.flash('error', '账号只能是英文字母或数字！');
		res.redirect('/register');
	} else {
		const CAPTCHA = Math.floor(100000 + Math.random() * 899999);

		let user = await User.findOne({where: { account }});
		if (user) {
			req.flash('error', '用户已存在');
			res.redirect('/register');
		} else {
			bcrypt.hash(password, saltRounds, async (err, hash) => {
				const avatar = gender === '男' ? AVATAR_BOY : AVATAR_GIRL;
				const intGender = gender === '男' ? 1 : 0;

				let user = await User.create({ 
					email, 
					account, 
					username: account, 
					password: hash,
					avatar,
					gender: intGender
				});
				// let transporter = nodemailer.createTransport({
				// 	host: 'smtp.163.com',
				// 	port: 465,
				// 	secure: true,
				// 	auth: {
				// 		user: EMAIL_ACCOUNT,
				// 		pass: EMAIL_PASS
				// 	}
				// });

				const msg = {
					to: email,
					from: '"小当家" <venus@venusworld.cn>',
					subject: '小当家注册验证',
					html: `<p>${user.dataValues.username}：</p><p>&nbsp;&nbsp;请点击以下链接完成邮箱验证：</p><p><a href="${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}">${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}</a></p><p>如果以上链接无法点击，请将上面的地址复制到你的浏览器地址栏。</p>`
				};
			
				// const mailOption = {
				// 	from: `"小当家" <${EMAIL_ACCOUNT}>`,
				// 	to: email,
				// 	subject: '小当家注册验证',
				// 	html: `<p>${user.dataValues.username}：</p><p>&nbsp;&nbsp;请点击以下链接完成邮箱验证：</p><p><a href="${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}">${CLOUD_HOSTNAME}:${PORT}/confirmEmail?captcha=${CAPTCHA}&email=${email}&account=${account}</a></p><p>如果以上链接无法点击，请将上面的地址复制到你的浏览器地址栏。</p>`
				// };
				
				const timestamp = new Date().getTime();
				await Captcha.create({
					timestamp,
					used: false,
					value: CAPTCHA,
					userId: user.dataValues.id
				});
				// transporter.sendMail(mailOption, (error) => {
				sgMail.send(msg).then(() => {
					// req.session.user = user.dataValues;
					// req.session.user.following = [];
					// req.session.user.followers = [];
					req.session.account = user.dataValues.account;
					req.flash('info', '注册成功，请验证邮箱后再登录。');
					res.redirect('/login');
				}).catch(error => {
					console.log(error);
					req.flash('error', '注册出错！');
					res.redirect('/');
				});
			});
		}
	}
});

module.exports = router;