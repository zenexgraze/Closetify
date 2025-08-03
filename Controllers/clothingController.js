const ClothingItem = require('../Models/clothingItem');

const getMyClothes = async (req, res) => {
    try {
        const uid = req.user.uid;
        const clothes = await ClothingItem.find({ userId: uid });

        const result = clothes.map(item => ({
            contentType: item.contentType,
            imageData: item.imageData.toString('base64'),
            detectedItems: item.detectedItems,
            createdAt: item.createdAt
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch clothes' });
    }
};

module.exports = getMyClothes;
