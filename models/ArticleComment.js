module.exports = function(sequelize, DataTypes) {
	return sequelize.define('articleComment', {
		content: {
			type: DataTypes.TEXT,
			allowNull: false
		},
	});
};
