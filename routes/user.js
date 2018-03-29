const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	if (req.isAuthenticated()) {
		res.render('user');
	}
	req.flash('error', '请先登录！');
	res.redirect('login');
});

module.exports = router;