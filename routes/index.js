const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	// if (req.isAuthenticated()) {
	// 	res.render('index', { username: req.user });
	// } else {
	// 	res.render('index');
	// }
	res.render('index');
});

module.exports = router;