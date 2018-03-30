const Sequelize = require('sequelize');

const DATABASE_NAME = 'smallmenu';
const DATABASE_USERNAME = 'root';
const DATABASE_PASSWORD = 'root';
const HOSTNAME = 'localhost';

let sequelize = new Sequelize(
	DATABASE_NAME,
	DATABASE_USERNAME,
	DATABASE_PASSWORD, 
	{
		host: HOSTNAME,
		dialect: 'mysql',
		port: 3306,
		operatorsAliases: false
	});

const User = sequelize.import('./user');
const Captcha = sequelize.import('./captcha');

User.hasMany(User, { foreignKey: 'following', targetKey: 'id'});
User.hasMany(User, { foreignKey: 'followed', targetKey: 'id'});

Captcha.belongsTo(User);

sequelize.sync();

module.exports = {
	User,
	Captcha
};
