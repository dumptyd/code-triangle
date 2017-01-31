const router = require('express').Router();
const projectRoute = function (Project, User, Github, isLoggedIn) {
    router.post('/', isLoggedIn, function (req, res) {
      let recProject = req.body.project;
      if(!recProject.fullName)
        return res.sendStatus(400);
      if(recProject.fullName.split('/')[0]!=req.user.github.username)
        return res.sendStatus(401);
      let preparedUrl = `/repos/${recProject.fullName}`;
      let description = recProject.description;
      let tags = [];
      if(recProject.tags && Array.isArray(recProject.tags) && recProject.tags.length > 0 && recProject.tags.length < 6) 
        recProject.tags.forEach( (x, i) => {
          let text = x.text || x;
          if(tags.length > 5 || tags.indexOf(text) > 0 || text.length > 15)
            return; 
          tags.push(text);
        });

      Project.count({fullName: recProject.fullName}, function(err, count){
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        if(count<1) {
          Github.get(preparedUrl, {}, function (err, status, body, headers) {
            if(err) {
              console.log(err);
              return res.sendStatus(400);
            }
            if(!tags.length)
              tags.push(body.language);
            let project = new Project({
              name: body.name,
              fullName: body.full_name,
              githubId: body.id,
              description: description || body.description,
              githubUrl: body.html_url,
              language: body.language,
              tags: tags
            });
            project.save(function(err, returnedProject) {
              req.user.submitted.push(returnedProject._id);
              req.user.save();
              return res.send({message: 'Project added.'});
            });
          });
        }
        else {
          Project.findOne({fullName: recProject.fullName}, function(err, project) {
            if(err) {
              console.log(err);
              return res.sendStatus(500);
            }
            User.findById(req.user._id, function(err, user) {
              user.submitted.splice(user.submitted.indexOf(project._id), 1);
              user.save();
              Project.findByIdAndRemove(project._id, function(err) {
                if(err) {
                  console.log(err);
                  return res.sendStatus(500);
                }
                return res.send({message: 'Project removed.'});
              }); 
            });
          });
        }
      });
    });

    router.get('/', function (req, res) {
      Project.find({}).exec(function (err, projects) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else res.status(200).send({
          projects: projects
        });
      });
    });

    router.get('/get', function (req, res) {
      if(!req.query.fullName) {
        return res.sendStatus(400);
      }
      Project.findOne({fullName: req.query.fullName}, function (err, project) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else if(project) {
          res.status(200).send({
            project: project
          });
        }
        else {
          res.sendStatus(404);
        }
      });
    });

    router.post('/update', function (req, res) {
      let recProject = req.body.project;
      if(!recProject.fullName)
        return res.sendStatus(400);
      let tags = [];
      recProject.tags.forEach( (x, i) => {
        if(i > 4)
          return; 
        tags.push(x.text || x);
      });
      if(!tags.length) {
        return res.sendStatus(400);
      }
      Project.update({fullName: recProject.fullName}, {
        description: recProject.description,
        tags: tags
      }, function(err, raw) {
        if(err) {
          console.log(err);
          return res.sendStatus(500);
        }
        res.sendStatus(200);
      });
    });

    return router;
  };
module.exports = projectRoute;