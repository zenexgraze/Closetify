const express = require('express');
const router = express.Router();
const User = require('../Models/users');
const verifyFirebaseToken = require('../Middleware/verifyfirebasetoken');
const getMyClothes = require('../Controllers/clothingController');

router.get('/me', verifyFirebaseToken, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/clothes', verifyFirebaseToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        const clothes = await Clothing.find({ userId });
        res.status(200).json({ clothes });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clothes.' });
    }
});

router.get('/clothes/me', verifyFirebaseToken, getMyClothes);



module.exports = router;
