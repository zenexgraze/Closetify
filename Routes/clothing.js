const express = require('express');
const router = express.Router();
const ClothingItem = require('../Models/clothingItem');

// Route to get categorized clothing for a user
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const items = await ClothingItem.find({ userId });

        const categories = {
            shirts: [],
            pants: [],
            dresses: []
        };

        items.forEach(item => {
            if (!item.detectedItems || item.detectedItems.length === 0) return;

            const mainItem = item.detectedItems[0].item.toLowerCase();

            const imageUrl = `/api/clothing/image/${item._id}`;

            if (mainItem === 'shirt') {
                categories.shirts.push(imageUrl);
            } else if (mainItem === 'pants') {
                categories.pants.push(imageUrl);
            } else if (mainItem === 'dress') {
                categories.dresses.push(imageUrl);
            }
        });

        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong fetching clothing items' });
    }
});

// Route to serve the actual image from DB
router.get('/image/:id', async (req, res) => {
    try {
        const item = await ClothingItem.findById(req.params.id);
        if (!item) return res.status(404).send('Image not found');

        res.set('Content-Type', item.contentType);
        res.send(item.imageData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to load image');
    }
});

module.exports = router;
