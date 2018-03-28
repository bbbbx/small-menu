module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			validata: {
				isEmail: true,
				notNull: true,
				notEmpty: true,
			}
		},
		username: { 
			type: DataTypes.STRING, 
			allowNull: false 
		},
		password: { 
			type: DataTypes.STRING, 
			allowNull: false 
		},
	});
};
