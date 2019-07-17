/* eslint-disable no-underscore-dangle */
// require npm modules
require('dotenv').config();
const express = require('express');

const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const hbs = require('hbs');
const multer = require('multer');
// const SlackStrategy = require('passport-slack').Strategy;
// const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// models
const User = require('./models/user');
const Itinerary = require('./models/itinerary');
const Review = require('./models/review');

// mongoose connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connected to MongoDB');
});

// morgan
app.use(morgan('dev'));

// define hbs views
app.set('view engine', 'hbs');
app.set('views', `${__dirname  }/views`);

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

// express session
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60,
  }),
}));

// passport config
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.use(new LocalStrategy({
  passReqToCallback: true,
}, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: 'Incorrect username or password' });
    }
    return next(null, user);
  });
}));

app.use(passport.initialize());
app.use(passport.session());

// routes path
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const itineraryRoutes = require('./routes/itinerary');
app.use('/itinerary', itineraryRoutes);

app.listen(process.env.PORT, () => console.log(`server is running on port ${process.env.PORT}`));
