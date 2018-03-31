const express = require('express');
const { Menu } = require('../models/index');
const router = express.Router();

router.get('/:id', function(req, res) {
	const { id } = req.params;
	Menu.findOne({ where: { id }})
		.then(menu => {
			if (!menu) {
				req.flash('error', '菜谱不存在');
				res.redirect('/');
			} else {
				// console.log(menu.dataValues);
				let temp = menu.steps.split(';');
				// console.log(temp);
				menu.dataValues.steps = [];
				for (let i = 0; i < temp.length; i++) {
					if (i % 2 === 0) {
						menu.dataValues.steps[parseInt(i/2)] = {};
						menu.dataValues.steps[parseInt(i/2)].img = temp[i];
					} else {
						menu.dataValues.steps[parseInt(i/2)].step = temp[i];
					}
				}
				res.render('detail', { result: menu.dataValues });
			}
		});
	// var result = req.session.foodData[id];
	// res.render('detail', { result });
});

module.exports = router;