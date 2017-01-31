require('dotenv').config({silent:true});
const express = require('express'),
      app = express(),
      port = process.env.OPENSHIFT_NODEJS_PORT || 3000,
      ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
      mongoose = require('mongoose'),
      passport = require('passport'),
      session = require('express-session'),
      MongoStore = require('connect-mongo')(session),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      path = require('path'),
      User = require('./models/user'),
      Project = require('./models/project'),
      Github = require('octonode').client({
        id: process.env.GITHUB_CLIENT_ID,
        secret: process.env.GITHUB_CLIENT_SECRET
      });
// configuration ===============================================================
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});
var db = mongoose.connection;
require('./config/passport')(passport);
app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000*60*60*24*7
  },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname , 'public')));
//-------------------------routes------------------------------//
  const auth = require('./routes/auth')(passport),
        profile = require('./routes/profile')(User, Github),
        addProject = require('./routes/projects')(Project, User, Github, isLoggedIn),
        logout = require('./routes/logout')();
//----------------------------routes----------------------------//
app.get('/', function (req, res) {
  res.render('index', {user: req.user});
});
//---------------//
app.use('/auth', auth);
app.use('/logout', isLoggedIn, logout);
app.use('/profile', isLoggedIn, profile);
app.use('/projects', addProject);
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){return next();}
  res.redirect('/');
}

db.once('open', function (err) {
  app.listen(port, ip, function(){
    console.log(`Running on ${ip}:${port} `);
  });
});