const router = require('express').Router();
const logoutRoute = function () {
  router.get('/', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  return router;
};
module.exports = logoutRoute;