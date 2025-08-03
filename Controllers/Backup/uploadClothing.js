// controllers/uploadClothing.js
const path = require('path');
const fs = require('fs');

const uploadClothing = async (req, res) => {
    try {
        const fileName = `${req.file.filename}.png`;
        const outputPath = path.join('uploads', fileName);

        // ✅ File is already converted to PNG by middleware, saved as uploads/filename.png
        // ❌ No Firebase upload — just return local path
        const publicUrl = `/uploads/${fileName}`;

        return res.json({ url: publicUrl });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Upload failed' });
    }
};

module.exports = { uploadClothing };
