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
const UserMenu = sequelize.import('./userMenu');


User.hasMany(User, { as: 'Following', foreignKey: 'following', sourceKey: 'id'});
User.hasMany(User, { as: 'Followed', foreignKey: 'followed', sourceKey: 'id'});

Captcha.belongsTo(User);

User.belongsToMany(Menu, { through: UserMenu});
Menu.belongsToMany(User, { through: UserMenu});

User.hasMany(Comment);
Menu.hasMany(Comment);

sequelize.sync();

module.exports = {
	User,
	Captcha,
	Menu,
	Comment,
	UserMenu
};
