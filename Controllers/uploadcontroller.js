// controllers/uploadClothing.js by Caron
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const upload = multer({ dest: 'uploads/' });
const bucket = admin.storage().bucket();

const uploadClothing = async (req, res) => {
    const outputPath = path.join('Uploads', `${req.file.filename}.png`);

    try {
        const uploadFile = await bucket.upload(outputPath, {
            destination: `clothing/${req.file.originalname}.png`,
            contentType: 'image/png',
            public: true,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Cleanup temp files
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputPath);

        const publicUrl = uploadFile[0].publicUrl();
        return res.json({ url: publicUrl });

    } catch (uploadErr) {
        console.error(uploadErr);
        return res.status(500).json({ error: 'Upload failed' });
    }
};

module.exports = { uploadClothing, upload };
