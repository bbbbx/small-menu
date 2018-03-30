const express = require('express');
const router = express.Router();
const { User } = require('../models/index');

router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		res.render('user');
	} else if (req.session.user) {
		res.locals.currentUser = req.session.user;
		res.render('user');
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