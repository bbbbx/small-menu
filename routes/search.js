const express = require('express');
const axios = require('axios');
const router = express.Router();

const BASE_URL = 'http://apis.juhe.cn/cook/query?';
const API_KEY = '8faabb9fc33c881c35defc18d217b2e1';

router.get('/', function(req, res, next) {
	const { foodName } = req.query;

	axios.get(BASE_URL, {
		params: {
			key: API_KEY,
			menu: foodName
		}
	})
		.then(function (response) {
			if (response.data.result === null) {				
				next();
				return ;
			}
			res.app.locals.data = {};
			for (var i = 0; i < response.data.result.data.length; i++) {
				res.app.locals.data[response.data.result.data[i].id] = response.data.result.data[i];
			}
			res.render('seacher', { data: response.data });
		});
});

module.exports = router;