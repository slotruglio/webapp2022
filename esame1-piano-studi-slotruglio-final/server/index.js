'use strict';

// import dependencies
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

// import routers
const courseRouter = require('./routers/courseRouter');
const studyPlanRouter = require('./routers/studyPlanRouter');

// import user dao for authentication
const userDao = require('./dao/userDao');

// set-up passport
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUserByEmail(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect email and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserialize user for session: get current logged in user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = new express();
const port = 3001;

// set-up middleware
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions)); // just for development and exam

// middleware for checking if a given request ic coming from a logged-in user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  res.status(401).json({error: 401, message: 'Unauthorized'});
}

// set-up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'studyplan secret',
  resave: false,
  saveUninitialized: false 
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

/*** API ***/

// set-up routers
app.use('/api', courseRouter);
app.use('/api/studyPlan', isLoggedIn, studyPlanRouter);

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(200).json(req.user);
      });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
  res.status(200).json(req.user);}
else
  res.status(401).json({error: 401, message: 'Unauthenticated user!'});
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});