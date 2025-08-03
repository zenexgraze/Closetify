const express = require('express');
const router = express.Router();
const { getUserClothes } = require('../Controllers/clothingController');
const verifyfirebaseToken = require('../Middleware/verifyfirebasetoken');

router.get('/mine', verifyfirebaseToken, getUserClothes);

module.exports = router;
