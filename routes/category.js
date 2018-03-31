const express = require('express');
const axios = require('axios');
const { CATEGORY_URL, API_KEY } = require('../utilities/const');
const router = express.Router();

router.get('/:cid', function(req, res) {
	const { cid } = req.params;
	axios.get(CATEGORY_URL, {
		params: {
			key: API_KEY,
			cid,
			rn: 30
		}
	}).then(response => {
		if (!response.data.result) {
			req.flash('error', '种类错误');
			res.redirect('/');
		} else {
			res.render('category', { data: response.data});
		}
	});
	// res.render('category');
});

module.exports = router;