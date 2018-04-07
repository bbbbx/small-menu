module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			validata: {
				isEmail: true,
				notNull: true,
				notEmpty: true,
			},
			comment: '用户邮箱'
		},
		account: {
			type: DataTypes.STRING, 
			allowNull: false,
			comment: '用户账号'
		},
		username: { 
			type: DataTypes.STRING, 
			allowNull: false,
			comment: '用户姓名'
		},
		password: { 
			type: DataTypes.STRING, 
			allowNull: false,
			comment: '用户密码'
		},
		gender: {
			type: DataTypes.INTEGER,
			allowNull: true,
			comment: '用户性别'
		},
		avatar: {
			type: DataTypes.STRING(400),
			allowNull: false,
			defaultValue: 'http://ohjn9v8nd.bkt.clouddn.com/boy.png',
			comment: '用户头像'
		},
		intro: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: '此人没有简介',
			comment: '用户简介'
		},
		confirmed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			comment: '用户是否已验证邮箱'
		},
	});
};
