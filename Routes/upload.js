const express = require('express');
const router = express.Router();
const multer = require('multer');

const verifyFirebaseToken = require('../Middleware/verifyfirebasetoken');
const convertToPng = require('../Middleware/convertToPng');
const { uploadClothing } = require('../controllers/uploadClothing');

// Multer config with custom storage (optional)
const upload = multer({ dest: 'uploads/' });

router.post(
    '/upload-clothing',
    verifyFirebaseToken,
    upload.single('image'),
    convertToPng,
    uploadClothing
);

module.exports = router;
