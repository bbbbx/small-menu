const express = require('express');
const router = express.Router();
const { User } = require('../models/index');

router.get('/', function(req, res) {
	if (req.isAuthenticated() || req.session.user) {
		// res.locals.currentUser = req.session.user ? req.session.user: req.user;
		res.locals.collections = [];
		User.findOne({ where: {id: res.locals.currentUser.id }})
			.then(user => {
				if (!user) {
					req.flash('error', '用户不存在！');
					res.redirect('/login');
				} else {
					user.getMenus().then(menus => {
						menus.map((value, index) => {
							res.locals.collections.push(menus[index]);
						});
						res.render('user');
					});
				}
			});
	} else {
		req.flash('error', '请先登录！');
		res.redirect('login');
	}
});

router.get('/:id', function(req, res) {
	const { id } = req.params;
	User.findById(id)
		.then(user => {
			if (user) {
				res.locals.currentUser = user.dataValues;
				res.render('user');
			} else {
				req.flash('error', '用户不存在！');
				res.redirect('/login');
			}
		});

});

module.exports = router;