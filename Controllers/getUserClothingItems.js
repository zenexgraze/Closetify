const getUserClothingItems = async (req, res) => {
    try {
        const items = await ClothingItem.find({ userId: req.user.uid });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch items' });
    }
};
