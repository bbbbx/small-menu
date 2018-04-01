module.exports = function(sequelize, DataTypes) {
	return sequelize.define('comment', {
		// title: {
		// 	type: DataTypes.STRING,
		// 	allowNull: false
		// },
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
	});
};
