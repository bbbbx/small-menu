module.exports = function(sequelize, DataTypes) {
	return sequelize.define('menu', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			comment: 'id'
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '食谱名'
		},
		tags: {
			type: DataTypes.STRING(1000),
			allowNull: false,
			comment: '食谱标签'
		},
		imtro: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: '食谱简介'
		},
		ingredients: {
			type: DataTypes.STRING(2000),
			allowNull: false,
			comment: '食谱原料'
		},
		burden: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '食谱佐料'
		},
		albums: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '食谱封面图像'
		},
		steps: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: '食谱步骤'
		}
	});
};
