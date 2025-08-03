// routes/clothingImage.js
const express = require('express');
const ClothingItem = require('../Models/clothingItem');
const router = express.Router();

// GET /api/clothing/:userId
router.get('/:userId', async (req, res) => {
    try {
        const items = await ClothingItem.find({ userId: req.params.userId });

        const categories = {
            shirts: [],
            pants: [],
            dresses: []
        };

        items.forEach(item => {
            const prefix = item.filename.toLowerCase();

            // Return endpoint to fetch image blob
            const imageUrl = `/api/clothing/image/${item._id}`;

            if (prefix.includes('shirt')) categories.shirts.push(imageUrl);
            else if (prefix.includes('pant')) categories.pants.push(imageUrl);
            else if (prefix.includes('dress')) categories.dresses.push(imageUrl);
        });

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load clothing items' });
    }
});

// GET /api/clothing/image/:id
router.get('/image/:id', async (req, res) => {
    try {
        const item = await ClothingItem.findById(req.params.id);

        if (!item) return res.status(404).send('Not found');

        res.set('Content-Type', item.contentType);
        res.send(item.imageData);
    } catch (err) {
        res.status(500).send('Error loading image');
    }
});

module.exports = router;
