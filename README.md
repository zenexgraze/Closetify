
# 🧠 AI Stylist Chatbot

An intelligent virtual wardrobe assistant that suggests outfit combinations based on uploaded clothing images — powered by **Gemini 1.5 Flash**, a **Colab-based vision model**, and **Firebase authentication**.

![AI Stylist Banner](https://user-images.githubusercontent.com/your-banner-image)

---

## 🚀 Features

✨ **Clothing Image Upload + Tagging**  
Upload images of shirts or pants. A Colab-hosted vision model detects and labels them.

🤖 **Gemini-Powered Chatbot**  
Get personalized outfit suggestions or correct item tags using Gemini 1.5 Flash.

🧠 **Wardrobe Memory**  
Your uploads are saved and reused for intelligent outfit recommendations.

🔐 **User Auth with Firebase**  
Log in securely with Firebase to view and manage your wardrobe.

🧱 **Clean Architecture**  
Modular routes, middleware, and controller setup for scalability.

---

## 📁 Folder Structure

```
ai-stylist-chatbot/
│
├── app.js                   # Entry point
├── .env                     # Environment variables
├── package.json
│
├── Controllers/
│   └── chatController.js    # Gemini and wardrobe logic
│
├── Middleware/
│   └── verifyFirebaseToken.js  # Firebase auth middleware
│
├── Models/
│   └── ClothingItem.js      # Mongoose schema for wardrobe items
│
├── Routes/
│   └── ai-chat.js           # /upload and /generate-outfit routes
│
├── Public/
│   ├── home.html            # Upload page
│   ├── upload.html          # Alternative upload UI
│   └── tryon.html           # AR-based try-on interface
│
├── Uploads/
│   └── <image-files>        # Temp storage for uploaded images
```

---

## 🔧 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-stylist-chatbot.git
cd ai-stylist-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup your environment variables

Create a `.env` file in the root with:

```env
MONGO_URI=<your_mongodb_uri>
GEMINI_API_KEY=<your_gemini_api_key>
COLAB_API_URL=<your_colab_api_endpoint>
```

### 4. Start the server

```bash
node app.js
```

Server will run on `http://localhost:3000`

---

## 🗂️ API Endpoints

| Route                 | Description                              |
|----------------------|------------------------------------------|
| `POST /upload`       | Uploads image → Detects clothing item    |
| `POST /generate-outfit` | Prompts Gemini for suggestions or corrections |

---

## 💬 Sample Gemini Prompt

```txt
Here's what the user has:
- Shirt: black, cotton
- Pant: beige chinos

Suggest a modern and casual outfit. Short and stylish.
```

---

## 🧪 Tech Stack

| Layer         | Tech Used           |
|---------------|---------------------|
| Frontend      | HTML, Vanilla JS    |
| Backend       | Node.js, Express    |
| AI Chat       | Gemini 1.5 Flash    |
| Vision Model  | Python (Colab API)  |
| Auth          | Firebase Auth       |
| Database      | MongoDB (Mongoose)  |
| Image Uploads | Multer              |

---

## 🙌 Contributing

PRs and suggestions are welcome! If you'd like to improve the chatbot's intelligence or frontend UI, open an issue or submit a pull request.

---

## 📄 License

MIT License. Free to use, share, and build on.

---

> Built with 👗🧠 by [YourName]
