/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */
const express = require('express');
const authRoutes = express.Router();
const passport = require('passport');
const ensureLogin = require('connect-ensure-login');

const multer = require('multer');
const upload = multer({ dest: './public/uploads/' });

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const User = require('../models/user');

// guide signup
authRoutes.get('/guide-signup', (req, res, next) => {
  const days = [];
  for (let i = 1; i <= 31; i += 1) {
    days.push(i);
  }
  const months = [];
  for (let i = 1; i <= 12; i += 1) {
    months.push(i);
  }
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= (currentYear - 100); i -= 1) {
    years.push(i);
  }
  res.render('auth/guide-signup', { days, months, years });
});

authRoutes.post('/guide-signup', upload.single('profileImg'), (req, res, next) => {
  const {
    role, name, username, birthDateDay, birthDateMonth, birthDateYear, phone, email, languages, interests, about, password,
  } = req.body;
  let profileImg = '/images/default-avatar.png';
  if (req.file !== undefined) {
    profileImg = `/uploads/${req.file.filename}`;
  }

  if (name === '' || username === '' || birthDateDay === '' || birthDateMonth === '' || birthDateYear === '' || phone === '' || email === '' || password === '') {
    res.render('auth/signup', { message: 'Please, fill all required fields.' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/guide-signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt, null);

      const newUser = new User({
        role,
        name,
        username,
        birthDate: { day: birthDateDay, month: birthDateMonth, year: birthDateYear },
        phone,
        email,
        languages,
        interests,
        about,
        profileImg,
        password: hashPass,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/guide-signup', { message: 'Something went wrong!' });
        } else {
          res.redirect(`/auth/profile/${newUser.id}`);
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

// tourist signup
authRoutes.get('/tourist-signup', (req, res, next) => {
  const days = [];
  for (let i = 1; i <= 31; i += 1) {
    days.push(i);
  }
  const months = [];
  for (let i = 1; i <= 12; i += 1) {
    months.push(i);
  }
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= (currentYear - 100); i -= 1) {
    years.push(i);
  }
  res.render('auth/tourist-signup', { days, months, years });
});

authRoutes.post('/tourist-signup', upload.single('profileImg'), (req, res, next) => {
  const {
    role, name, username, birthDateDay, birthDateMonth, birthDateYear, phone, email, languages, interests, about, password 
  } = req.body;
  const profileImg = `/uploads/${req.file.filename}`;

  if (name === '' || username === '' || birthDateDay === '' || birthDateMonth === '' || birthDateYear === '' || phone === '' || email === '' || password === '') {
    res.render('auth/signup', { message: 'Please, fill all required fields.' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/tourist-signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt, null);

      const newUser = new User({
        role,
        name,
        username,
        birthDate: { day: birthDateDay, month: birthDateMonth, year: birthDateYear },
        phone,
        email,
        languages,
        interests,
        about,
        profileImg,
        password: hashPass,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/tourist-signup', { message: 'Something went wrong!' });
        } else {
          res.redirect(`/auth/profile/${newUser.id}`);
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

// function for checking logged user
const checkUserLogged = () => (req, res, next) => {
  if (req.isAuthenticated() && req.user.id === req.params.id) {
    next();
  } else {
    res.redirect(`/auth/profile/${req.user._id}`);
  }
};


// profile
authRoutes.get('/profile/:id', ensureLogin.ensureLoggedIn('/auth/login'), checkUserLogged(), (req, res, next) => {
  const userID = req.params.id;
  User.findById(userID)
    .then(((user) => {
      res.render('auth/profile', user);
    }))
    .catch(err => console.log(err));
});


// edit profile
authRoutes.get('/edit/:id', ensureLogin.ensureLoggedIn('/auth/login'), checkUserLogged(), (req, res, next) => {
  const userID = req.params.id;
  User.findById(userID)
    .then(((user) => {
      // COLOCAR LISTA DE TODAS AS LÍNGUAS DO SIGNUP
      const allLanguages = ['Portuguese', 'Spanish', 'English', 'Catalan', 'Deutch'];
      if (user.languages) {
        for (let i = 0; i < allLanguages.length; i += 1) {
          for (let j = 0; j < user.languages.length; j += 1) {
            if (allLanguages[i] === user.languages[j]) {
              allLanguages.splice(i, 1);
            }
          }
        }
      }
      // COLOCAR LISTA DE TODAS OS INTERESSES
      const allInterests = ['Sports', 'Bars', 'Party', 'Cars', 'Children'];
      if (user.interests) {
        for (let i = 0; i < allInterests.length; i += 1) {
          for (let j = 0; j < user.interests.length; j += 1) {
            if (allInterests[i] === user.interests[j]) {
              allInterests.splice(i, 1);
            }
          }
        }
      }
      const days = [];
      for (let i = 1; i <= 31; i += 1) {
        days.push(i);
      }
      const months = [];
      for (let i = 1; i <= 12; i += 1) {
        months.push(i);
      }
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear; i >= (currentYear - 100); i -= 1) {
        years.push(i);
      }
      res.render('auth/edit', { user, allLanguages, allInterests, days, months, years });
    }))
    .catch(err => console.log(err));
});

authRoutes.post(('/edit/:id'), upload.single('profileImg'), (req, res, next) => {
  let {
    name, birthDateDay, birthDateMonth, birthDateYear, phone, email, languages, interests, about, oldProfileImg, oldPassword, profileImg, password 
  } = req.body;
  if (req.file === undefined) {
    profileImg = oldProfileImg;
  } else {
    profileImg = `/uploads/${req.file.filename}`;
  }

  if (password === '') {
    password = oldPassword;
  } else {
    const salt = bcrypt.genSaltSync(bcryptSalt);
    password = bcrypt.hashSync(password, salt, null);
  }

  const birthDate = { day: birthDateDay, month: birthDateMonth, year: birthDateYear };

  User.updateOne({ _id: req.params.id }, { $set: { name, birthDate, phone, email, languages, interests, about, profileImg, password } })
    .then(() => {
      res.redirect(`/auth/profile/${req.params.id}`);
    })
    .catch(err => console.log(err));
});

// login
authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login');
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.render('auth/login', { message: 'Wrong credentials' }); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect(`/auth/profile/${user._id}`);
    });
  })(req, res, next);
});

// logout
authRoutes.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = authRoutes;
