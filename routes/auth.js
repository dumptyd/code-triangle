const router = require('express').Router();
const authRoutes = function (passport) {
    router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }), function (req, res) {});

    router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
      res.redirect('/');
    });

    return router;
  };
module.exports = authRoutes;