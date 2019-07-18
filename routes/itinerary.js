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
      console.log('aquiii');
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
  const categories = ['Sports', 'Bars', 'Lgbt', 'Family']; 
  User.findById(userID)
    .then(((user) => {
      res.render('itinerary/create', { user, hours, minutes, categories, googleKey });
    }))
    .catch(err => console.log(err));
});


itineraryRoutes.post('/create', (req, res, next) => {
  const { name, city, description, capacity, languages, categories, place } = req.body;
  let { date } = req.body;
  dateDay = new Date(date).getDate() + 1;
  dateMonth = new Date(date).getMonth() + 1;
  dateYear = new Date(date).getFullYear();
  date = `${dateDay}/${dateMonth}/${dateYear}`;
  const owner = req.user._id;
  if (name === '' || city === '' || date === '' || description === '' || capacity === '' || languages === '' || categories === '' || place === '') {
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
    categories,
    places: placesObjArr,
    owner,
  });
  newItinerary.save((err) => {
    if (err) {
      res.send(err);
    } else {
      User.updateOne({ _id: owner }, { $push: { itineraries: { itinerary: newItinerary._id, number: 0} } })
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
      let isSubs = false;
      let number = 0;
      if (user) {
        user.itineraries.forEach(((el) => {
          if (JSON.stringify(el.itinerary._id) === JSON.stringify(itineraryID) && user.role === 'tourist') {
            isSubs = true;
            number = el.number;
          }
        }));
      }
      let availableSubscribe = false;
      if (itinerary.remainingCapacity > 0) {
        availableSubscribe = true;
      }
      const remainingCapacityArr = [];
      for (let i = 1; i <= itinerary.remainingCapacity; i += 1) {
        remainingCapacityArr.push(i);
      }
      res.render('itinerary/itinerary', { itinerary, user, remainingCapacityArr, isRole, isSubs, availableSubscribe, number });
    }))
    .catch(err => console.log(err));
});

itineraryRoutes.post('/itinerary/:id', checkRolesContinue('tourist'), (req, res, next) => {
  let subscribersNum = 0;
  let { number } = req.body;
  if (req.body.updateSubscribeNum) {
    if (parseInt(req.body.updateSubscribeNum, 10) === 0) {
      subscribersNum = 0;
    } else {
      subscribersNum = (parseInt(req.body.updateSubscribeNum, 10) - parseInt(req.body.number, 10));
    }
  }
  if (req.body.subscribeNum) {
    subscribersNum = parseInt(req.body.subscribeNum, 10);
  }
  const itineraryID = req.params.id;
  Itinerary.findById(itineraryID)
    .then((singleItinerary) => {
      Itinerary.updateOne({ _id: itineraryID }, { $set: { remainingCapacity: singleItinerary.remainingCapacity - subscribersNum },
        $push: { subscribers: { tourist: req.user._id, number: subscribersNum } } })
        .then((() => {
          User.updateOne({ _id: req.user._id }, { $pull: { itineraries: { itinerary: itineraryID } } })

          if (parseInt(req.body.updateSubscribeNum, 10) !== 0) {
            User.updateOne({ _id: req.user._id }, { $addToSet: { itineraries: { itinerary: itineraryID, number } } })
              .then(() => {
                res.redirect(`/itinerary/itinerary/${itineraryID}`);
              })
              .catch(error => console.log(error));
          } else {
            User.updateOne({ _id: req.user._id }, { $pull: { itineraries: { itinerary: itineraryID } } })
              .then(() => {
                res.redirect(`/itinerary/itinerary/${itineraryID}`);
              })
              .catch(error => console.log(error));
          }
        }))
        .catch(err => console.log(err));
    })
    .catch(error => console.log(error));
});

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
