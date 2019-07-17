/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */
require('dotenv').config();
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
const checkUserLogged = () => (req, res, next) => {
  if (req.isAuthenticated() && req.user.id === req.params.id) {
    next();
  } else {
    res.redirect(`/auth/profile/${req.user._id}`);
  }
};

// function for checking role and continuing
const checkRolesContinue = (userRole) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === userRole) {
      req.isRole = true;
      next();
    } else {
      req.isRole = false;
      next();
    }
  };
};

// function for checking role and redirecting
const checkRolesRedirect = (userRole) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === userRole) {
      req.isRole = true;
      next();
    } else {
      req.isRole = false;
      res.redirect(`/auth/profile/${req.user.id}`);
    }
  };
};

const checkUserLoggedOwner = () => (req, res, next) => {
  const itineraryID = req.params.id;
  let ownerID = '';
  Itinerary.findById(itineraryID)
    .then((itinerary) => {
      ownerID = itinerary.owner;
      if (req.isAuthenticated() && JSON.stringify(req.user.id) === JSON.stringify(ownerID)) {
        next();
      }
    })
    .catch(() => res.redirect(`/auth/profile/${req.user._id}`));
};

// create itinerary
itineraryRoutes.get('/create', ensureLogin.ensureLoggedIn('/auth/login'), checkRolesRedirect('guide'), (req, res, next) => {
  const googleKey = process.env.MAPS_KEY;
  const userID = req.user._id;
  const hours = [];
  for (let i = 0; i <= 23; i += 1) {
    hours.push(`${i}`.padStart(2, 0));
  }
  const minutes = [];
  for (let i = 0; i < 60; i += 15) {
    minutes.push(`${i}`.padStart(2, 0));
  }
  const cathegories = ['Sports', 'Bars', 'Lgbt', 'Family']; 
  User.findById(userID)
    .then(((user) => {
      res.render('itinerary/create', { user, hours, minutes, cathegories, googleKey });
    }))
    .catch(err => console.log(err));
});


itineraryRoutes.post('/create', (req, res, next) => {
  const { name, city, description, capacity, languages, cathegories, place } = req.body;
  let { date } = req.body;
  dateDay = new Date(date).getDate() + 1;
  dateMonth = new Date(date).getMonth() + 1;
  dateYear = new Date(date).getFullYear();
  date = `${dateDay}/${dateMonth}/${dateYear}`;
  const owner = req.user._id;
  if (name === '' || city === '' || date === '' || description === '' || capacity === '' || languages === '' || cathegories === '' || place === '') {
    res.render('itinerary/create', { message: 'Please, fill all required fields.' });
    return;
  }

  const placesObjArr = [];
  if (Array.isArray(place)) {
    place.forEach((el) => {
      const placeArrSplit = el.split(':');
      placeObj = {
        hours: placeArrSplit[0],
        minutes: placeArrSplit[1],
        name: placeArrSplit[2],
        id: placeArrSplit[3],
      };
      placesObjArr.push(placeObj);
    });
  } else {
    const placeArrSplit = place.split(':');
    placeObj = {
      hours: placeArrSplit[0],
      minutes: placeArrSplit[1],
      name: placeArrSplit[2],
      id: placeArrSplit[3],
    };
    placesObjArr.push(placeObj);
  }

  const newItinerary = new Itinerary({
    name,
    city,
    date,
    description,
    capacity,
    remainingCapacity: capacity,
    languages,
    cathegories,
    places: placesObjArr,
    owner,
  });

  newItinerary.save((err) => {
    if (err) {
      res.send(err);
    } else {
      User.updateOne({ _id: owner }, { $push: { itineraries: newItinerary._id } })
        .then(() => {
          res.redirect(`/auth/profile/${req.user._id}`);
        })
        .catch(error => console.log(error));
    }
  });
});

// view each itinerary
itineraryRoutes.get('/itinerary/:id', checkRolesContinue('tourist'), (req, res, next) => {
  const { user } = req;
  const { isRole } = req;
  const itineraryID = req.params.id;
  Itinerary.findById(itineraryID)
    .then(((itinerary) => {
      const remainingCapacityArr = [];
      for (let i = 1; i <= itinerary.remainingCapacity; i += 1) {
        remainingCapacityArr.push(i);
      }
      res.render('itinerary/itinerary', { itinerary, user, remainingCapacityArr, isRole });
    }))
    .catch(err => console.log(err));
});

itineraryRoutes.post('/itinerary/:id', checkRolesContinue('tourist'), (req, res, next) => {
  const subscribers = parseInt(req.body.subscribeNum, 10);
  const itineraryID = req.params.id;
  Itinerary.findById(itineraryID)
    .then((singleItinerary) => {
      Itinerary.updateOne({ _id: itineraryID }, { $set: { remainingCapacity: singleItinerary.remainingCapacity - subscribers } })
        .then((() => {
          res.redirect(`/itinerary/itinerary/${itineraryID}`);
        }))
        .catch(err => console.log(err));
    })
    .catch(error => console.log(error));
});

// User.updateOne({ _id: req.params.id }, { $set: { name, birthDate, phone, email, languages, interests, about, profileImg, password } })
//     .then(() => {
//       res.redirect(`/auth/profile/${req.params.id}`);
//     })
//     .catch(err => console.log(err));

// edit itinerary
itineraryRoutes.get('/edit/:id', ensureLogin.ensureLoggedIn('/auth/login'), checkUserLoggedOwner(), (req, res, next) => {
  const itineraryID = req.params.id;
  Itinerary.findById(itineraryID)
    .then(((itinerary) => {
      res.render('itinerary/edit', { itinerary });
    }))
    .catch(err => console.log(err));
});

module.exports = itineraryRoutes;
