const express = require('express');
const axios = require('axios');
const { Menu } = require('../models/index');
const { CATEGORY_URL } = require('../utilities/const');
const router = express.Router();

router.get('/:cid/:pn', function(req, res) {
	const { cid, pn } = req.params;
	if (isNaN(parseInt(cid))) {
		req.flash('error', '找不到你的地方种类！');
		res.redirect('/');
	} else {
		axios.get(CATEGORY_URL, {
			params: {
				key: process.env.MENU_API_KEY,
				cid,
				rn: 30,
				pn: parseInt(pn)
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
					if (i === response.data.result.data.length - 1) {
						res.render('category', { data: response.data, cid, pn: parseInt(pn), totalNum: parseInt(response.data.result.totalNum), totalNumPage: Math.ceil(parseInt(response.data.result.totalNum)/30)});
					}
				}
				// res.render('category', { data: response.data});
			}
		}).catch(err => {
			res.status(200).send(`聚合 API 请求错误 ${err}`);
		});
	}
	// res.render('category');
});

module.exports = router;