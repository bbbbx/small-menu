const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	// if (req.isAuthenticated()) {
	// 	res.render('index', { currentUser: req.user });
	// } else {
	// 	res.render('index');
	// }
	if (req.session.user) {
		res.locals.currentUser = req.session.user;
	}
	res.render('index');
});

module.exports = router;