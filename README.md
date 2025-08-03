# 👗✨ AI Stylist Backend

**Your Personal Wardrobe Advisor — Backend API**

This is the backend server for **AI Stylist**, a mobile app that helps users digitize their wardrobe, get outfit suggestions, and personalize their style.  

This version is an **MVP** built with **Node.js (Express.js)**, **MongoDB**, and **Firebase Auth** — using simple hardcoded outfit rules (no LLM yet).

---

## 🚀 Features

✅ Secure Firebase Authentication  
✅ Upload & manage wardrobe items  
✅ Get outfit suggestions with basic styling rules  
✅ Save user feedback on outfits  
✅ MongoDB for storage  
✅ Designed to add Computer Vision & GPT later

---

## 🗂️ Tech Stack

- **Node.js + Express.js**
- **MongoDB** (via Mongoose)
- **Firebase Admin SDK**
- **CORS**
- **dotenv**

---

## 📂 Project Structure

ai-stylist-backend/
├── server.js
├── .env
├── models/
│ ├── User.js
│ ├── WardrobeItem.js
│ └── Feedback.js
├── routes/
│ ├── wardrobe.js
│ ├── stylist.js
├── middleware/
│ └── auth.js
├── stylistRules.js
├── uploads/ (optional for local images)
├── package.json


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/YOUR-USERNAME/ai-stylist-backend.git
cd ai-stylist-backend
2️⃣ Install Dependencies

npm install
3️⃣ Add .env File
Create a .env file:

MONGODB_URI=your_mongodb_uri
GOOGLE_APPLICATION_CREDENTIALS=JSON_STRINGIFY_YOUR_GOOGLE_APPLICATION_CREDENTIALS
PORT=5000
MongoDB URI: MongoDB Atlas

Firebase Service Account: Generate a private key JSON in Firebase Console → Project Settings → Service Accounts → then JSON.stringify the whole file.

4️⃣ Run the Server

npm run dev
(Uses nodemon for hot reload in dev mode)

🔐 Firebase Auth
Your React Native app must send a Firebase ID token in every request header:

Authorization: Bearer <firebase_id_token>
The backend checks this on every protected route.

📌 API Endpoints
📍 Wardrobe
Method	Route	Description
POST	/api/wardrobe/upload	Add wardrobe item
GET	/api/wardrobe/list	Get wardrobe items

📍 Stylist
Method	Route	Description
POST	/api/stylist/suggest	Get outfit suggestion based on simple rules
POST	/api/stylist/feedback	Save user feedback



✅ Example Request
POST /api/stylist/suggest

Headers:
  Authorization: Bearer <firebase_id_token>

Body:
{
  "occasion": "casual"
}
Example Response:

{
  "suggestion": "Blue T-shirt + Jeans + Sneakers"
}


🧩 Roadmap
Integrate CV to auto-tag clothes

Upgrade outfit suggestions to use GPT (LLM)

Add AR virtual try-on

Improve personalization with feedback loops



🙌 Credits


