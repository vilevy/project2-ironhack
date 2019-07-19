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
  const categories = ['Arts', 'Bar & Nightlife', 'Beliefs', 'Career & Business', 'Cars & Vehicles', 'Dance', 'Family', 'Fashion & Beauty', 'Food & Drink', 'LGBTQ', 'Language & Culture', 'Learning & Courses', 'Music', 'Outdoors & Adventure', 'Pets',  'Photography', 'Shopping', 'Social', 'Sports & Fitness', 'Tech']; 
  User.findById(userID)
    .then(((user) => {
      res.render('itinerary/create', { user, hours, minutes, categories, googleKey });
    }))
    .catch(err => console.log(err));
});


itineraryRoutes.post('/create', (req, res, next) => {
  const { name, city, description, capacity, languages, categories, place } = req.body;
  let { date } = req.body;
  dateDay = new Date(date).getDate();
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
        lat: placeArrSplit[4],
        long: placeArrSplit[5],        
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
      lat: placeArrSplit[4],
      long: placeArrSplit[5], 
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
  const googleKey = process.env.MAPS_KEY;
  const { user } = req;
  const { isRole } = req;
  let number = 0;
  const itineraryID = req.params.id;
  let isSubs = false;

  // if user have already subscribed, set isSubs to true and get number of members
  Itinerary.findById(itineraryID)
    .populate('owner')
    .then(((itinerary) => {
      const { subscribers } = itinerary;
      subscribers.forEach((el) => {
        if (user) {
          if (JSON.stringify(el.tourist) === JSON.stringify(user._id)) {
            isSubs = true;
            number = el.number;
          }
        }
      });
      let availableSubscribe = false;
      if (itinerary.remainingCapacity > 0) {
        availableSubscribe = true;
      }
      const remainingCapacityArr = [];
      if (itinerary.remainingCapacity >= number) {
        for (let i = 1; i <= itinerary.remainingCapacity; i += 1) {
          remainingCapacityArr.push(i);
        }
      } else {
        for (let i = 1; i <= number; i += 1) {
          remainingCapacityArr.push(i);
        }
      }
      res.render('itinerary/itinerary', { itinerary, user, remainingCapacityArr, isRole, isSubs, availableSubscribe, number, googleKey });
    }))
    .catch(err => console.log(err));
});

itineraryRoutes.post('/itinerary/:id', checkRolesContinue('tourist'), (req, res, next) => {
  let subscribersNum = parseInt(req.body.subscribeNum, 10);
  if (req.body.updateNum) {
    subscribersNum = parseInt(req.body.updateNum, 10);
  }
  const itineraryID = req.params.id;
  let number = 0;
  Itinerary.findById(itineraryID)
    .then(((itinerary) => {
      const { subscribers } = itinerary;
      subscribers.forEach((el) => {
        if (JSON.stringify(el.tourist) === JSON.stringify(req.user._id)) {
          number = el.number;
        }
      });
    }))
    .catch(err => console.log(err));

  Itinerary.findById(itineraryID)
    .then((singleItinerary) => {
      // if sets update to 0 (same as unsubscribe)
      if (subscribersNum === 0) {
        User.updateOne({ _id: req.user._id }, { $pull: { itineraries: itineraryID } })
          .then(() => {
            Itinerary.updateOne({ _id: itineraryID }, { $pull: { subscribers: { tourist: req.user._id } }, $set: { remainingCapacity: singleItinerary.remainingCapacity + number } }, { multi: true })
              .then(() => {
                res.redirect(`/itinerary/itinerary/${itineraryID}`);
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      // if subscribe (not update)
      } else if (!req.body.updateNum) {
        Itinerary.updateOne({ _id: itineraryID }, { $set: { remainingCapacity: singleItinerary.remainingCapacity - subscribersNum },
          $push: { subscribers: { tourist: req.user._id, number: subscribersNum } } })
          .then((() => {
            User.updateOne({ _id: req.user._id }, { $push: { itineraries: itineraryID } })
              .then(() => res.redirect(`/itinerary/itinerary/${itineraryID}`))
              .catch(err => console.log(err));
          }))
          .catch(err => console.log(err));
      // if updates, not 0 value
      } else {
        const newNumber = subscribersNum;
        subscribersNum -= number;
        if (subscribersNum > number) subscribersNum *= -1;
        Itinerary.updateOne({ _id: itineraryID }, { $set: { remainingCapacity: singleItinerary.remainingCapacity - subscribersNum, subscribers: { tourist: req.user._id, number: newNumber } } })
          .then((() => {
            User.updateOne({ _id: req.user._id }, { $push: { itineraries: itineraryID } })
              .then(() => res.redirect(`/itinerary/itinerary/${itineraryID}`))
              .catch(err => console.log(err));
          }))
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
});

itineraryRoutes.post(('/search'), (req, res, next) => {
  let { city, categories, dateFrom, dateTo } = req.body;
  const user = req.user;
  dateFromDay = new Date(dateFrom).getDate();
  dateFromMonth = new Date(dateFrom).getMonth() + 1;
  dateFromYear = new Date(dateFrom).getFullYear();
  dateFrom = `${dateFromDay}${dateFromMonth}${dateFromYear}`;

  dateToDay = new Date(dateTo).getDate();
  dateToMonth = new Date(dateTo).getMonth() + 1;
  dateToYear = new Date(dateTo).getFullYear();
  dateTo = `${dateToDay}/${dateToMonth}/${dateToYear}`;

  console.log(dateTo);
  if (categories === undefined) {
    categories = ['Arts', 'Bar & Nightlife', 'Beliefs', 'Career & Business', 'Cars & Vehicles', 'Dance', 'Family', 'Fashion & Beauty', 'Food & Drink', 'LGBTQ', 'Language & Culture', 'Learning & Courses', 'Music', 'Outdoors & Adventure', 'Pets',  'Photography', 'Shopping', 'Social', 'Sports & Fitness', 'Tech'];
  }

  Itinerary.find({ $and: [{ city }, { categories: { $in: categories } }] })
    .populate('owner')
    .then((results) => {
      res.render('itinerary/search', { results, user });
    })
    .catch(err => console.log(err));
});


itineraryRoutes.get('/api/:id', (req, res, next) => {
  Itinerary.find({ _id: req.params.id })
    .then((places) => {
      res.status(200).json({ places });
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = itineraryRoutes;
