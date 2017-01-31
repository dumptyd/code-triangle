const router = require('express').Router();
const profileRoute = function (User, Github) {
  router.get('/repos', function (req, res) {
    let preparedUrl = `/users/${req.user}/repos`;
    User.findOne({_id: req.user._id}).select('submitted github.username github.avatarUrl').populate('submitted').exec(function(err, user) {
      Github.get('/users/dumptyd/repos', {}, function (err, status, body, headers) {
        let repos = [];
        body.forEach(repo => {
          let obj = {
            fullName: repo.full_name,
            name: repo.name,
            description: repo.description,
            language: repo.language,
            url: repo.html_url,
            inList: false
          };
          if(user.submitted.findIndex(function(e) {return repo.full_name == e.fullName}) > -1){
            obj.inList = true
          }
          repos.push(obj);
        });
        let userToSend = {
          username: user.github.username,
          avatarUrl: user.github.avatarUrl
        };
        res.send({
          repos: repos,
          user: userToSend
        });
      });
    });
  });

  router.get('/', function(req, res) {
    res.render('profile', {user: req.user});
  });

  return router;
};
module.exports = profileRoute;