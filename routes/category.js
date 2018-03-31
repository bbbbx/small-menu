const express = require('express');
const axios = require('axios');
const { Menu } = require('../models/index');
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
			var steps = '';
			for (let i = 0; i < response.data.result.data.length; i++) {
				for (let j = 0; j < response.data.result.data[i].steps.length; j++) {
					steps += `${response.data.result.data[i].steps[j].img};`;
					if (j === response.data.result.data[i].steps.length - 1) {
						steps += response.data.result.data[i].steps[j].step;
					} else {
						steps += `${response.data.result.data[i].steps[j].step};`;
					}
				}
				Menu.findOrCreate({
					where: {
						id: parseInt(response.data.result.data[i].id)
					},
					defaults: {
						title: response.data.result.data[i].title,
						tags: response.data.result.data[i].tags,
						imtro: response.data.result.data[i].imtro,
						ingredients: response.data.result.data[i].ingredients,
						burden: response.data.result.data[i].burden,
						albums: response.data.result.data[i].albums[0],
						steps
					}
				}).spread((user, created) => {
					
				});
				steps = '';
				if (i === response.data.result.data.length-1) {
					res.render('category', { data: response.data});
				}
			}
			// res.render('category', { data: response.data});
		}
	});
	// res.render('category');
});

module.exports = router;