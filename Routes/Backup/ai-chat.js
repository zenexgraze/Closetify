const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const COLAB_AI_STYLIST_API_URL = process.env.COLAB_AI_STYLIST_API_URL; // Default URL if not set




let detectedClothingItems = [];
// Keep track of the last item *successfully detected and added* to aid corrections
let lastDetectedItem = null;

// Multer storage configuration for handling image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        // Create the 'uploads' directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath); // Store uploaded files in the 'uploads/' directory
    },
    filename: function (req, file, cb) {
        // Create a unique filename using a timestamp and original file extension
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in your .env file. Please check .env and restart.");
    process.exit(1); // Exit if the API key is not configured
}

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configure Gemini model with a detailed system instruction for both styling and corrections
const geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Using the flash model for faster responses
    systemInstruction: {
        parts: [{
            text: `You are an AI stylist. Your sole purpose is to suggest fashion outfits based on a user's *mood or occasion* and a list of *available clothing items*.
        
        **CRITICAL RULE FOR CORRECTIONS:** If the user explicitly corrects a detail about an AVAILABLE clothing item (e.g., "that dress is white, not red", or "actually, it's a blue shirt"), you MUST respond with a JSON object. This is your ONLY response if a correction is detected. When formulating the JSON, pay close attention to the *last item mentioned or detected* if the user is correcting "it". The JSON format must be EXACTLY:
        \`\`\`json
        {
        "action": "update_item",
          "item_type": "[type_of_clothing_item]", // e.g., "dress", "shirt", "trousers". Use the precise type if provided by the user or from the context of the last detected item. Otherwise, use a general type like "shirt" for "t-shirt".
          "current_color": "[detected_color]", // The color you previously thought it was, inferring from the context.
          "corrected_color": "[user_specified_color]" // The color the user says it is
        }
        \`\`\`
        Example JSON response for correcting the last detected "red dress" to "white": \`{"action": "update_item", "item_type": "dress", "current_color": "red", "corrected_color": "white"}\`

        **FOR OUTFIT SUGGESTIONS:** If no correction is made, always refer to the AVAILABLE clothing items when making suggestions. Suggest suitable shoes and simple accessories (like jewelry, scarves, belts, or bags) to complement the outfit. Maintain a helpful, friendly, and focused tone on fashion. The output you give should be simple, like a friend giving ideas. For example: "Try this color top with those pants, and if you have those shoes in that color try them on too." Your text answer should be in just a couple of lines.

        **FOR UNRELATED QUESTIONS:** If a user asks for something unrelated to fashion or outfit styling, gently but firmly redirect them back to outfit suggestions based on their clothing items. For example, say "My expertise is in fashion! Tell me the mood or occasion you're dressing for, and I'll help you create an outfit from your uploaded clothes."
        `}]
    }
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Public', 'ai-chat.html'));
});

router.post('/upload', upload.single('image'), async (req, res) => {
    console.log("Upload endpoint hit");

    if (!req.file) {
        console.log("No file received");
        return res.status(400).send('No file uploaded');
    }

    console.log("File received:", req.file.path);


    const filePath = req.file.path;
    let stylistPredictions = null;

    try {
        const imageBuffer = fs.readFileSync(filePath); // Read the image file into a buffer
        const formData = new FormData();
        // const filePath = req.file.path; // Absolute path from multer
        // const filePath = path.join(__dirname, '../Uploads', originalName);
        const imageStream = fs.createReadStream(filePath);
        formData.append('image', imageStream, req.file.originalname);
        // Append the image buffer to FormData for multipart/form-data request
        // formData.append('image', imageBuffer, {
        //     filename: originalName,
        //     contentType: req.file.mimetype,
        // });


        // const imageStream = fs.createReadStream(filePath); // Use stream instead of buffer
        // formData.append('image', imageStream, originalName);

        console.log("Sending image to Colab AI Stylist...");
        // Send the image to the Colab API for inference
        const colabResponse = await axios.post(COLAB_AI_STYLIST_API_URL, formData, {
            headers: {
                ...formData.getHeaders() // Important for setting Content-Type header
            },
            timeout: 60000 // Add a timeout (e.g., 60 seconds)
        });

        console.log("Received raw response from Colab:", colabResponse.data);
        stylistPredictions = colabResponse.data;

        // Process predictions and add them to the accumulated wardrobe
        if (stylistPredictions && Array.isArray(stylistPredictions.predictions)) {
            // Clear last detected item if multiple items are in one image
            // For simplicity, let's assume one main item per image for correction context
            // If multiple items are in the image, the last one will be set as 'lastDetectedItem'
            let newItems = [];
            stylistPredictions.predictions.forEach(p => {
                // Ensure 'item' and 'color' fields are present from Colab API response
                if (p.item && p.color) {
                    const newItem = {
                        item: p.item,
                        color: p.color
                    };
                    detectedClothingItems.push(newItem);
                    newItems.push(newItem); // Keep track of items just added
                }
            });

            // Set lastDetectedItem to the last item added if any
            if (newItems.length > 0) {
                lastDetectedItem = newItems[newItems.length - 1];
                console.log("Set lastDetectedItem:", lastDetectedItem);
            } else {
                lastDetectedItem = null; // No new items detected
            }

            console.log("Accumulated clothing items:", detectedClothingItems);
        }

    } catch (error) {
        console.error("Error calling Colab API:", error.message);
        if (error.response) {
            console.error("Colab API Response Error Data:", error.response.data);
            console.error("Colab API Response Status:", error.response.status);
        } else if (error.code === 'ECONNABORTED') {
            console.error("Colab API request timed out.");
        }
    } finally {
        // Clean up: delete the temporary uploaded file

        // Delay the deletion to ensure the stream isn't still being read
        setTimeout(() => {
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting temp file:", err);
                else console.log("Temp file deleted:", filePath);
            });
        }, 3000); // Wait 3 seconds to be safe
    }


    // Send the final response back to the frontend
    const finalResponse = {
        message: 'Image uploaded and processed successfully',
        detectedItemsFromImage: stylistPredictions ? stylistPredictions.predictions : [], // Items detected in THIS image
        allAccumulatedItems: detectedClothingItems // All items currently in the "wardrobe"
    };
    console.log("Sending final response to frontend:", finalResponse);
    res.status(200).json(finalResponse);
});

// Helper function for flexible item type matching
const areItemTypesSimilar = (detectedType, requestedType) => {
    const dType = detectedType.toLowerCase().trim();
    const rType = requestedType.toLowerCase().trim();

    // Option 1: Simple includes check (e.g., "shirt" in "tee shirt" or vice-versa)
    if (dType.includes(rType) || rType.includes(dType)) {
        return true;
    }

    // Option 2: Predefined synonyms/mappings (expand as needed)
    // This makes matching more robust for common variations
    const synonyms = {
        "shirt": ["t-shirt", "tee shirt", "blouse", "polo shirt", "top", "short_sleeved_shirt"],
        "t-shirt": ["shirt", "tee shirt", "top", "short_sleeved_shirt"],
        "tee shirt": ["shirt", "t-shirt", "top", "short_sleeved_shirt"],
        "blouse": ["shirt", "top"],
        "top": ["shirt", "t-shirt", "tee shirt", "blouse"], // Added 'top' as a general term
        "short_sleeved_shirt": ["shirt", "t-shirt", "tee shirt", "top"], // Added for your specific case
        "dress": ["gown", "sundress", "maxi dress"],
        "pants": ["trousers", "jeans"],
        "trousers": ["pants", "jeans"],
        "jeans": ["pants", "trousers"],
        // Add more common clothing item synonyms here
    };

    // Check if requestedType is a key and detectedType is in its synonym list
    if (synonyms[rType] && synonyms[rType].includes(dType)) {
        return true;
    }
    // Check if detectedType is a key and requestedType is in its synonym list (for reverse lookup)
    if (synonyms[dType] && synonyms[dType].includes(rType)) {
        return true;
    }

    return false;
};


// Endpoint for generating outfit suggestions or handling wardrobe corrections via chat
router.post('/generate-outfit', async (req, res) => {
    const { messages } = req.body; // Conversation history from the frontend

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "No conversation history provided." });
    }

    if (detectedClothingItems.length === 0) {
        return res.status(400).json({ error: "No clothing items available for styling. Please upload photos first." });
    }

    // Prepare the list of available items from the current wardrobe for Gemini's context
    const itemsList = detectedClothingItems.map(item => `${item.color.toLowerCase()} ${item.item.toLowerCase()}`).join(', ');

    // Format conversation history for the Gemini API
    const formattedHistory = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(part => ({ text: part.text }))
    }));

    const latestUserMessageContent = messages[messages.length - 1].parts[0].text;

    // --- IMPORTANT IMPROVEMENT: Provide context about the last detected item ---
    let userMessageWithContext = `Available items in wardrobe: ${itemsList}. User's request/mood: ${latestUserMessageContent}`;

    if (lastDetectedItem) {
        userMessageWithContext += ` (Context: The last item processed was a ${lastDetectedItem.color} ${lastDetectedItem.item}).`;
    }
    // --- END IMPORTANT IMPROVEMENT ---


    // Start a chat session with Gemini, including the formatted history
    const chat = geminiModel.startChat({
        history: formattedHistory,
        generationConfig: {
            maxOutputTokens: 500, // Limit output length
            temperature: 0.7, // Creativity level
            topP: 0.95, // Nucleus sampling
            topK: 60, // Top-k sampling
        },
    });

    try {
        const result = await chat.sendMessage(userMessageWithContext);
        const response = await result.response;
        let generatedText = response.text(); // Gemini's raw response (could be JSON or plain text)

        console.log("Received raw response from Gemini:", generatedText);

        let outfitSuggestion;
        let isCorrection = false;

        // --- IMPORTANT FIX: Clean the generatedText from markdown code block delimiters ---
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/);
        let potentialJsonString = generatedText;

        if (jsonMatch && jsonMatch[1]) {
            potentialJsonString = jsonMatch[1].trim(); // Extract the content inside the markdown block
            console.log("Extracted potential JSON string:", potentialJsonString);
        }
        // --- END FIX ---

        try {
            // Attempt to parse the (potentially cleaned) string as JSON
            const parsedGeminiResponse = JSON.parse(potentialJsonString);

            // Check if the parsed response matches our specific correction JSON structure
            if (parsedGeminiResponse.action === "update_item" &&
                parsedGeminiResponse.item_type &&
                parsedGeminiResponse.current_color &&
                parsedGeminiResponse.corrected_color) {

                isCorrection = true;
                const { item_type, current_color, corrected_color } = parsedGeminiResponse;

                let updated = false;
                let originalDetectedItemName = ""; // To store the original name like "tee shirt"

                // Iterate through the global wardrobe array and update the first matching item
                // Prioritize matching the lastDetectedItem if one exists and matches the criteria
                let itemsToSearch = [...detectedClothingItems]; // Create a copy to potentially reorder
                if (lastDetectedItem) {
                    // Move the lastDetectedItem to the front for prioritized matching
                    itemsToSearch = itemsToSearch.filter(item => !(item.item === lastDetectedItem.item && item.color === lastDetectedItem.color));
                    itemsToSearch.unshift(lastDetectedItem);
                }

                for (let i = 0; i < itemsToSearch.length; i++) {
                    const itemInWardrobe = itemsToSearch[i];
                    // Match by item type (using fuzzy comparison) and the color Gemini originally detected
                    if (areItemTypesSimilar(itemInWardrobe.item, item_type) &&
                        itemInWardrobe.color.toLowerCase() === current_color.toLowerCase()) {

                        // Find the actual item in the global array to update it
                        const indexInGlobalArray = detectedClothingItems.findIndex(item => item.item === itemInWardrobe.item && item.color === itemInWardrobe.color);

                        if (indexInGlobalArray !== -1) {
                            originalDetectedItemName = detectedClothingItems[indexInGlobalArray].item; // Store original name
                            detectedClothingItems[indexInGlobalArray].color = corrected_color.toLowerCase(); // Update to the user-corrected color
                            updated = true;
                            console.log(`Updated item: ${originalDetectedItemName} (originally ${current_color}) to ${corrected_color} in wardrobe.`);
                            break; // Stop after updating the first match
                        }
                    }
                }

                if (!updated) {
                    // If no matching item was found for the requested correction
                    console.log(`Correction requested for ${item_type} (from ${current_color} to ${corrected_color}), but no matching item found in wardrobe.`);
                    outfitSuggestion = `I tried to update your wardrobe, but couldn't find a ${current_color} ${item_type}. Could you clarify which item you mean? Or perhaps you'd like to try uploading it again?`;
                } else {
                    // This is the user-friendly confirmation message for a successful update
                    outfitSuggestion = `Ok! I've updated the ${originalDetectedItemName} from ${current_color} to ${corrected_color}. What's next?`;
                }
            } else {
                // If it's valid JSON but not our update_item structure, treat as a regular text response from Gemini
                outfitSuggestion = generatedText;
            }
        } catch (jsonParseError) {
            // If JSON.parse fails, it means Gemini returned plain text (which is expected for outfit suggestions)
            outfitSuggestion = generatedText;
        }

        // Send the response back to the frontend
        res.json({
            outfitSuggestion: outfitSuggestion, // This will be the AI's chat response (friendly update or outfit suggestion)
            message: isCorrection ? "Wardrobe item corrected!" : "Outfit suggestion generated successfully!", // Flag for frontend
            allAccumulatedItems: detectedClothingItems // The potentially updated wardrobe
        });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        let errorMessage = "Failed to generate outfit suggestion from AI.";
        if (error.response) {
            // Log more details if axios error has a response object
            console.error("Gemini API Response Error Data:", error.response.data);
            console.error("Gemini API Response Status:", error.response.status);
            errorMessage = `AI Error: ${error.response.data.error.message || error.response.data.error.status}`;
        } else if (error.message) {
            errorMessage = `AI Error: ${error.message}`;
        }
        res.status(500).json({ error: errorMessage });
    }
});


router.post('/clear-items', (req, res) => {
    detectedClothingItems = [];
    lastDetectedItem = null; // Clear this too
    console.log("Accumulated clothing items cleared.");
    res.status(200).json({ message: "All accumulated clothing items cleared." });
});

module.exports = router;