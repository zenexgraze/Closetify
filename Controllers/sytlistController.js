// controllers/stylistController.js
const FormData = require('form-data');
const { sendToColab } = require('../Services/collabService');
const { generateGeminiResponse } = require('../services/geminiService');
const ClothingItem = require('../Models/clothingItem'); // import model

let detectedClothingItems = [];

const uploadClothing = async (req, res) => {
    try {
        const firebaseUid = req.user.uid; // use UID from Firebase token
        const latestItem = await ClothingItem.findOne({ userId: firebaseUid }).sort({ createdAt: -1 });

        if (!latestItem) {
            return res.status(404).json({ error: "No clothing image found for this user." });
        }

        const formData = new FormData();
        formData.append('image', latestItem.imageData, {
            filename: latestItem.filename,
            contentType: latestItem.contentType,
        });

        const stylistPredictions = await sendToColab(formData);

        if (Array.isArray(stylistPredictions?.predictions)) {
            stylistPredictions.predictions.forEach(p => {
                if (p.item && p.color) {
                    detectedClothingItems.push({
                        item: p.item,
                        color: p.color
                    });
                }
            });
        }

        res.status(200).json({
            message: 'Image processed from MongoDB and predictions obtained',
            detectedItemsFromImage: stylistPredictions.predictions,
            allAccumulatedItems: detectedClothingItems
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process clothing from MongoDB." });
    }
};

const generateOutfit = async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "No conversation history provided." });
    }
    if (detectedClothingItems.length === 0) {
        return res.status(400).json({ error: "No clothing items available." });
    }

    try {
        const result = await generateGeminiResponse(messages, detectedClothingItems);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gemini API call failed." });
    }
};

const clearItems = (req, res) => {
    detectedClothingItems = [];
    res.status(200).json({ message: "Wardrobe cleared." });
};

module.exports = {
    uploadClothing,
    generateOutfit,
    clearItems
};
