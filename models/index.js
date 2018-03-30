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

const Menu = sequelize.import('./menu');
const User = sequelize.import('./user');
const Captcha = sequelize.import('./captcha');
const Comment = sequelize.import('./comment');


User.hasMany(User, { as: 'Following', foreignKey: 'following', sourceKey: 'id'});
User.hasMany(User, { as: 'Followed', foreignKey: 'followed', sourceKey: 'id'});

Captcha.belongsTo(User);

User.belongsToMany(Menu, {as: 'Collections', through: 'collectors_collections'});
Menu.belongsToMany(User, {as: 'Collectors', through: 'collectors_collections'});

User.hasMany(Comment);
Menu.hasMany(Comment);

sequelize.sync();

module.exports = {
	User,
	Captcha,
	Menu,
	Comment
};
