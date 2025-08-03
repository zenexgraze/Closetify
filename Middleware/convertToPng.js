// middlewares/convertToPng.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const convertToPng = async (req, res, next) => {
    if (!req.file) return next();

    const inputPath = req.file.path;
    const outputPath = path.join('uploads', `${req.file.filename}-converted.png`);

    try {
        await sharp(inputPath)
            .png()
            .toFile(outputPath);

        fs.unlinkSync(inputPath); // Remove the original file

        // Update req.file to reflect new PNG file
        req.file.path = outputPath;
        req.file.filename = `${req.file.filename}-converted`;
        req.file.originalname = `${path.parse(req.file.originalname).name}.png`;

        next();
    } catch (error) {
        console.error('Error converting to PNG:', error);
        return res.status(500).json({ error: 'Image conversion failed' });
    }
};

module.exports = convertToPng;
