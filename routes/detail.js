const express = require('express');
const router = express.Router();

router.get('/:id', function(req, res) {
	const { id } = req.params;
	var result = res.app.locals.data[id];
	res.render('detail', { result });
});

module.exports = router;