const express = require('express');
const axios = require('axios');
const { Menu } = require('../models/index');
const { BASE_URL } = require('../utilities/const');
const router = express.Router();

router.get('/', function(req, res) {
	const { foodName, pn } = req.query;

	if (foodName === '' || pn === '' || typeof pn === 'undefined') {
		req.flash('error', '参数错误！');
		res.redirect('/');
	}

	axios.get(BASE_URL, {
		params: {
			key: process.env.MENU_API_KEY,
			menu: foodName,
			rn: 30,
			pn: parseInt(pn)
		}
	})
		.then(response => {
			if (response.data.result === null) {				
				req.flash('error', `搜索失败，请确认菜名后再进行搜索！失败原因：${response.data.reason}`);
				res.redirect('/');
			} else {

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
						res.render('seacher', { data: response.data, foodName, pn: parseInt(pn), totalNum: parseInt(response.data.result.totalNum), totalNumPage: Math.ceil(parseInt(response.data.result.totalNum)/30)  });		
					}
				}
			}
		});
});

module.exports = router;