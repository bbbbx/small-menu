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
		account: {
			type: DataTypes.STRING, 
			allowNull: false 
		},
		username: { 
			type: DataTypes.STRING, 
			allowNull: false 
		},
		password: { 
			type: DataTypes.STRING, 
			allowNull: false 
		},
		gender: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		avatar: {
			type: DataTypes.STRING(400),
			allowNull: false,
			defaultValue: 'http://ohjn9v8nd.bkt.clouddn.com/boy.png'
		},
		confirmed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
};
