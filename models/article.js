module.exports = function(sequelize, DataTypes) {
	return sequelize.define('article', {
		title: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '文章标题'
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: '文章内容'
		},
		tags: {
			type: DataTypes.STRING(1000),
			allowNull: false,
			comment: '文章标签'
		},
		imtro: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: '文章简介'
		},
		album: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '文章封面图像'
		},
	});
};