const express = require('express');
const { Menu } = require('../models/index');
const router = express.Router();

router.get('/', function(req, res) {
	res.locals.menus = [];
	Menu.findAll().then(menus => {
		menus.map((value, index) => {
			res.locals.menus.push(menus[index].dataValues);
			if (index === menus.length - 1) {
				res.render('menu');
			}
		});
	});
});

module.exports = router;