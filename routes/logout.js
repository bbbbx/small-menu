const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
	res.app.locals.username = null;
	res.app.locals.password = null;
	res.redirect('/');
});

module.exports = router;