const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models/index');

passport.use('login', new LocalStrategy(
	function(username, password, done) {
		User.findOne({ where: { account: username }})
			.then(user => {
				if (!user) {
					return done(null, false, { message: '用户不存在!'});
				}
				bcrypt.compare(password, user.password, (err, isMatch) => {
					if (err) {
						return done(err);
					}
					if (isMatch) {
						return done(null, user);
					} else {
						return done(null, false, { message: '密码错误！'});
					}
				});
			});
	})
);

module.exports = () => {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findOne({ where: { id }})
			.then(user => {
				done(null, user);
			});
	});
};