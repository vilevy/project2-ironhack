/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */
const express = require('express');
const authRoutes = express.Router();
const passport = require('passport');

const multer = require('multer');
const upload = multer({ dest: './public/uploads/' });

const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const User = require('../models/user');

// guide signup
authRoutes.get('/guide-signup', (req, res, next) => {
  res.render('auth/guide-signup');
});

authRoutes.post('/guide-signup', upload.single('profileImg'), (req, res, next) => {
  const { role, name, username, birthDate, phone, email, languages, interests, about, password } = req.body;
  const profileImg = `/uploads/${req.file.filename}`;

  if (name === '' || username === '' || birthDate === '' || phone === '' || email === '' || password === '') {
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
        birthDate,
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
  res.render('auth/tourist-signup');
});

authRoutes.post('/tourist-signup', upload.single('profileImg'), (req, res, next) => {
  const { role, name, username, birthDate, phone, email, languages, interests, about, password } = req.body;
  const profileImg = `/uploads/${req.file.filename}`;

  if (name === '' || username === '' || birthDate === '' || phone === '' || email === '' || password === '') {
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
        birthDate,
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


// profile
authRoutes.get('/profile/:id', (req, res, next) => {
  const userID = req.params.id;
  User.findById(userID)
    .then(((user) => {
      res.render('auth/profile', user);
    }))
    .catch(err => console.log(err));
});


// edit profile
authRoutes.get('/edit/:id', (req, res, next) => {
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
      res.render('auth/edit', { user, allLanguages, allInterests });
    }))
    .catch(err => console.log(err));
});

authRoutes.post(('/edit/:id'), upload.single('profileImg'), (req, res, next) => {
  let { name, birthDate, phone, email, languages, interests, about, oldProfileImg, oldPassword, profileImg, password } = req.body;
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

  User.updateOne({ _id: req.params.id }, { $set: { name, birthDate, phone, email, languages, interests, about, profileImg, password } })
    .then(() => {
      res.redirect(`/auth/profile/${req.params.id}`);
    })
    .catch(err => console.log(err));
});

module.exports = authRoutes;
