const express = require('express');
const { Menu, User } = require('../models/index');
const router = express.Router();

router.get('/:id', function(req, res) {
	const { id } = req.params;
	res.locals.collectDisabled = false;
	
	if (req.session.user) {
		req.session.user.collections.map(value => {
			console.log(value.id === parseInt(id));
			if (value.id === parseInt(id)) {
				res.locals.collectDisabled = true;
			}
		});
	}

	Menu.findOne({ where: { id }})
		.then(menu => {
			if (!menu) {
				req.flash('error', '菜谱不存在');
				res.redirect('/');
			} else {
				let temp = menu.steps.split(';');
				menu.dataValues.steps = [];
				for (let i = 0; i < temp.length; i++) {
					if (i % 2 === 0) {
						menu.dataValues.steps[parseInt(i/2)] = {};
						menu.dataValues.steps[parseInt(i/2)].img = temp[i];
					} else {
						menu.dataValues.steps[parseInt(i/2)].step = temp[i];
					}
				}
				menu.getComments().then(comments => {
					res.locals.comments = [];
					if (comments.length === 0) {
						res.render('detail', { result: menu.dataValues });
					} else{
						comments.map((value, index) => {
							res.locals.comments[index] = comments[index].dataValues;
							User.findById(comments[index].userId).then(user => {
								res.locals.comments[index].user = user.dataValues;
								if (index === comments.length - 1) {
									res.render('detail', { result: menu.dataValues });
								}
							});
						});
					}
				});
			}
		});
});

module.exports = router;