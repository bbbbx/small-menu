const express = require('express');
const axios = require('axios');
const { Menu } = require('../models/index');
const { BASE_URL, API_KEY } = require('../utilities/const');
const router = express.Router();

router.get('/', function(req, res) {
	const { foodName } = req.query;

	axios.get(BASE_URL, {
		params: {
			key: API_KEY,
			menu: foodName
		}
	})
		.then(response => {
			if (response.data.result === null) {				
				req.flash('error', '搜索失败，请确认菜名后再进行搜索！');
				res.redirect('/');
			}
			
			req.session.foodData = {};
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
				req.session.foodData[response.data.result.data[i].id] = response.data.result.data[i];
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
					res.render('seacher', { data: response.data });		
				}
			}
		});
});

module.exports = router;