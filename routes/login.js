const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', function(req, res) {
	res.render('login');
});

router.post('/', passport.authenticate('login', {
	// successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}), function(req, res) {
	req.flash('info', '登录成功');
	res.redirect('/');
});

// router.post('/', function(req, res) {
// 	const { username, password } = req.body;
// 	if (typeof username === 'undefined' || username === null
// 		|| typeof password === 'undefined' || password === null) {
// 		req.flash('errors', '用户名或密码不能为空');
// 		res.redirect('/login');
// 	}
	
// 	User.findOne({where: { username }})
// 		.then(user => {
// 			if (user) {
// 				bcrypt.compare(password, user.password, (err, result) => {
// 					if (result) {
// 						res.app.locals.username = username;
// 						res.app.locals.passowrd = user.password;
// 						res.redirect('/');
// 					}
// 				});
// 			} else {
// 				req.flash('errors', '用户不存在');
// 				res.redirect('/login');
// 			}
// 		});
// });

module.exports = router;