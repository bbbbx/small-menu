const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	// req.logout();
	delete req.session.user;
	req.flash('info', '退出成功');
	res.redirect('/');
});

module.exports = router;