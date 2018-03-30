module.exports = function(sequelize, DataTypes) {
	return sequelize.define('captcha', {
		'timestamp': {
			type: DataTypes.STRING,
			allowNull: false
		},
		'used': {
			type: DataTypes.BOOLEAN,
			allowNull: false
		},
		'value': {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};
