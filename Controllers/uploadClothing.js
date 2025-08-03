const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { sendToColab } = require('../Services/collabService');
const ClothingItem = require('../Models/clothingItem');
const CustomAPIError = require('../Error/custom-error');

const uploadClothing = async (req, res, next) => {
    const file = req.file;
    const uid = req.user?.uid;

    if (!file) return next(new CustomAPIError('No file uploaded', 400));
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const filePath = file.path;
    const fileName = path.basename(filePath);
    const publicUrl = `/uploads/${fileName}`;

    try {
        // Read image from disk
        const imageBuffer = fs.readFileSync(filePath);

        // Prepare image for Colab API
        const formData = new FormData();
        formData.append('image', imageBuffer, {
            filename: fileName,
            contentType: 'image/png',
        });

        // Send image to Colab
        const colabResult = await sendToColab(formData);

        // Format detected items
        const detectedItems = Array.isArray(colabResult?.predictions)
            ? colabResult.predictions
                .filter(p => p.item && p.color)
                .map(p => ({ item: p.item, color: p.color }))
            : [];

        // Save to MongoDB
        await ClothingItem.create({
            userId: uid,
            filename: fileName,
            contentType: 'image/png',
            imageData: imageBuffer,
            detectedItems,
        });

        return res.status(200).json({
            message: 'Image uploaded and processed successfully',
            imageURL: publicUrl,
            detectedItemsFromImage: colabResult.predictions,
        });

    } catch (err) {
        console.error('[Upload Error]', err);
        return next(new CustomAPIError('Failed to process image', 500));
    } finally {
        // Always remove the uploaded file from disk
        fs.unlink(filePath, () => { });
    }
};

module.exports = { uploadClothing };
