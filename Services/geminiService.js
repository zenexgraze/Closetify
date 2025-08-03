const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: {
        parts: [{
            text: `You are a professional AI fashion stylist. Given a user's wardrobe and preferences, suggest stylish outfit combinations, accessories, and occasions to wear them. Be clear, concise, and fashion-savvy.`
        }]
    }
});

const generateGeminiResponse = async (messages, wardrobe) => {
    const itemsList = wardrobe.map(item => `${item.color.toLowerCase()} ${item.item.toLowerCase()}`).join(', ');

    const formattedHistory = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text }))
    }));

    const chat = geminiModel.startChat({
        history: formattedHistory,
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.95,
            topK: 60,
        },
    });

    const userMessage = messages[messages.length - 1]?.parts?.[0]?.text || '';
    const prompt = `Available items in wardrobe: ${itemsList}. User's request: ${userMessage}`;

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return {
        outfitSuggestion: text,
        message: "Generated successfully",
        allAccumulatedItems: wardrobe
    };
};

module.exports = { generateGeminiResponse };
