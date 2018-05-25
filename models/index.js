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

const Menu = sequelize.import('./Menu');
const User = sequelize.import('./User');
const Captcha = sequelize.import('./Captcha');
const Comment = sequelize.import('./Comment');
const Article = sequelize.import('./Article');
const ArticleComment = sequelize.import('./ArticleComment');
const UserMenu = sequelize.import('./UserMenu');
const UserArticle = sequelize.import('./UserArticle');
const UserFollowers = sequelize.import('./UserFollowers');
const UserFollowing = sequelize.import('./UserFollowing');

User.belongsToMany(User, { as: 'Following', through: UserFollowing});
User.belongsToMany(User, { as: 'Followers', through: UserFollowers});

Captcha.belongsTo(User);

User.belongsToMany(Menu, { through: UserMenu});
Menu.belongsToMany(User, { through: UserMenu});

User.hasMany(Comment);
Menu.hasMany(Comment);

Article.belongsTo(User);						// 文章作者
Article.hasMany(ArticleComment);		// 文章评论
User.hasMany(ArticleComment);				// 文章评论
Article.belongsToMany(User, { through: UserArticle });		// 文章收藏者
User.belongsToMany(Article, { through: UserArticle });		// 文章收藏者

sequelize.sync();

module.exports = {
	User,
	Captcha,
	Menu,
	Comment,
	Article,
	ArticleComment,
	UserMenu,
	UserFollowing,
	UserFollowers,
	UserArticle
};
