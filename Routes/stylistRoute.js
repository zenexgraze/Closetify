const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    uploadClothing,
    generateOutfit,
    clearItems
} = require('../Controllers/sytlistController');
const verifyFirebaseToken = require('../Middleware/verifyfirebasetoken');




// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// router.post('/upload', upload.single('image'), uploadClothing);
// router.post('/generate-outfit', generateOutfit);
// router.post('/clear-items', clearItems);
router.post('/upload', verifyFirebaseToken, upload.single('image'), uploadClothing);
router.post('/generate-outfit', verifyFirebaseToken, generateOutfit);
router.post('/clear-items', verifyFirebaseToken, clearItems);

module.exports = router;
