const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const COLAB_URL = process.env.COLAB_AI_STYLIST_API_URL;

const sendToColab = async (formData) => {
    try {
        const response = await axios.post(COLAB_URL, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 60000 // 60 seconds
        });

        if (response.status !== 200) {
            console.error(`Colab returned status ${response.status}`);
            throw new Error(`Colab returned non-200 response: ${response.status}`);
        }

        return response.data;
    } catch (err) {
        console.error('Error sending image to Colab:', err.message || err);
        throw err; // So controller can catch and return 500
    }
};

module.exports = { sendToColab };
