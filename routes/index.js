require('dotenv').config();
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const user = req.user;
  const googleKey = process.env.MAPS_KEY;
  res.render('index', { googleKey, user });
});

module.exports = router;

