/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */
const express = require('express');
const itineraryRoutes = express.Router();
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');

// const multer = require('multer');
// const upload = multer({ dest: './public/uploads/' });

// const bcrypt = require('bcrypt');
// const bcryptSalt = 10;

const User = require('../models/user');
const Itinerary = require('../models/itinerary');

// function for checking logged user
// const checkUserLogged = () => (req, res, next) => {
//   if (req.isAuthenticated() && req.user.id === req.params.id) {
//     next();
//   } else {
//     res.redirect(`/auth/profile/${req.user._id}`);
//   }
// };

// create itinerary
itineraryRoutes.get('/create', ensureLogin.ensureLoggedIn('/auth/login'), (req, res, next) => {
  const userID = req.user._id;
  const hours = [];
  for (let i = 0; i <= 23; i += 1) {
    hours.push(`${i}`.padStart(2, 0));
  }
  const minutes = [];
  for (let i = 0; i < 60; i += 15) {
    minutes.push(`${i}`.padStart(2, 0));
  }
  User.findById(userID)
    .then(((user) => {
      res.render('itinerary/create', { user, hours, minutes });
    }))
    .catch(err => console.log(err));
});

// const googleSearchApi = axios.create({
//   baseURL: 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=&inputtype=textquery&key=YOUR_API_KEY',
// });
// 'https://maps.googleapis.com/maps/api/place/autocomplete/xml?input=Amoeba&key=AIzaSyBCNveOYYDWSHcUG4jhYiKAEQh0y4l6vtI'
// // https://maps.googleapis.com/maps/api/place/queryautocomplete/json?key=AIzaSyBCNveOYYDWSHcUG4jhYiKAEQh0y4l6vtI&input=mas
// const getCountryInfo = (theName) => {
//   restCountriesApi.get(theName)
//     .then((responseFromAPI) => {
//       console.log('Response from API is: ', responseFromAPI.data);
//     })
//     .catch((err) => {
//       console.log('Error is: ', err);
//     });
// };

// document.getElementById('theButton').onclick = () => {
//   const country = document.getElementById('theInput').value;
//   getCountryInfo(country);
// };

itineraryRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.render('auth/login', { message: 'Wrong credentials' }); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect(`/auth/profile/${user._id}`);
    });
  })(req, res, next);
});

module.exports = itineraryRoutes;
