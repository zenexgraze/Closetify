const express = require('express');
const router = express.Router();

const { loginUser, logoutUser } = require('../Controllers/authcontroller');

router.post('/login', loginUser);

router.get('/logout', logoutUser);

module.exports = router;
