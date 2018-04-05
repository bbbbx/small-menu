const express = require('express');
const { Menu } = require('../models/index');
const router = express.Router();

router.get('/:offset', function(req, res) {
	const { offset } = req.params;
	res.locals.menus = [];
	Menu.findAll({
		offset: parseInt(offset),
		limit: 100
	}).then(menus => {
		if (menus.length === 0) {
			res.render('menu', { offset: 0 });
		} else {
			menus.map((value, index) => {
				res.locals.menus.push(menus[index].dataValues);
				if (index === menus.length - 1) {
					Menu.findAll().then(menus => {
						res.render('menu', { offset: parseInt(offset), totalNumPage: Math.ceil(menus.length/100), totalMenusNum: menus.length });
					});
					
				}
			});
		}
	});
});

module.exports = router;