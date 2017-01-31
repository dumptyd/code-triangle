//jshint node:true
var GitHubStrategy = require('passport-github2').Strategy;
var User = require('../models/user');
module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.github.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({
      'github.id': id
    }, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      let objToInsert = {
        github: {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile._json.avatar_url,
          accessToken: accessToken
        }
      };
      process.nextTick(function() {
        User.findOrCreate({'github.id': profile.id}, objToInsert, function(err, user, created) {
          return done(null, user);
        });
      });
    }
  ));
};