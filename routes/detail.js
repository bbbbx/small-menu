const express = require('express');
const { Menu, User } = require('../models/index');
const router = express.Router();

router.get('/:id', async (req, res) => {
	const { id } = req.params;
	res.locals.collectDisabled = false;
	
	if (req.session.user) {
		for (let i = 0; i < req.session.user.collections.length; i++) {
			if (req.session.user.collections[i].id === parseInt(id)) {
				res.locals.collectDisabled = true;
			}
		}
	}

	let menu = await Menu.findOne({ where: { id }})
	if (!menu) {
		req.flash('error', '菜谱不存在');
		res.redirect('/');
	} else {
		req.session.menuHistory = req.session.menuHistory ? req.session.menuHistory: [];
		req.session.menuHistory.push({
			id: menu.id,
			title: menu.title,
			tags: menu.tags,
			albums: menu.albums
		});

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
		let comments = await menu.getComments();
		res.locals.comments = [];
		if (comments.length === 0) {
			res.render('detail', { result: menu.dataValues });
		} else{
			comments.map(async (comment, index) => {
				res.locals.comments[index] = comment.dataValues;
				let user = await User.findById(comment.userId);
				res.locals.comments[index].user = user.dataValues;
				if (index === comments.length - 1) {
					res.render('detail', { result: menu.dataValues });
				}
			});
		}
	}
});

module.exports = router;