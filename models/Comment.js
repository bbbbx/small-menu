module.exports = function(sequelize, DataTypes) {
	return sequelize.define('comment', {
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
	});
};
