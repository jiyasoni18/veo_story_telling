# 🎬 Veo Ultimate - Advanced AI Video Prompt Generator

**Veo Ultimate** is a professional-grade prompt engineering tool designed for creators using Google's **Veo** video generation AI. It specializes in maintaining **Character Consistency**, ensuring strict **Visual Styles**, and organizing complex narratives into a **Story-based Hierarchy**.

![Status](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Backend-Flask-blue)
![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-green)
![AI](https://img.shields.io/badge/Powered_by-Gemini_1.5-purple)

---

## ✨ Features

### 🧠 Advanced Memory & consistency
*   **Story Mode**: Organizes your work into "Stories" with sequential scenes (Prompt History management).
*   **Scoped Context**: Generates prompt history based strictly on the characters *in the scene*, keeping the database clean.
*   **Persistent Storage**: Automatically saves all prompts, settings, and characters to **MongoDB Atlas** cloud.

### 🎨 Visual & Character Control
*   **Gemini Vision Integration**: Upload character sketches/images, and the AI (Gemini 1.5 Flash) will extract precise physical descriptions.
*   **Style Enforcement**: Force strict styles (e.g., *Pixar 3D*, *Cinematic Photorealism*, *Anime*) across all prompts.
*   **Dialogue Engine**: Generates precise lip-sync targets and structured dialogue logs for external TTS/Audio tools.

---

## 🛠️ Tech Stack

*   **Frontend**: Vanilla HTML5, CSS3 (Modern Dark Mode), JavaScript (ES6).
*   **Backend**: Python (Flask).
*   **Database**: MongoDB Atlas (Cloud NoSQL).
*   **AI Models**:
    *   **LLM Identity**: Hugging Face (Llama 3, Qwen, Phi).
    *   **Vision Analysis**: Google Gemini 1.5 Flash.

---

## 📂 Project Structure

```bash
veo-ultimate/
├── backend/            # Python Flask Server
│   ├── app.py          # Main application logic
│   ├── modules/        # Helper scripts
│   ├── requirements.txt
│   └── .env            # (User created) API Keys & DB connection
├── frontend/           # Client-side UI
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── start_veo.bat       # One-click launcher for Windows
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
1.  **Python 3.8+** installed.
2.  A **MongoDB Atlas** account (Free tier is fine).
    *   Get your connection string: `mongodb+srv://<user>:<password>@cluster...`

### Step 1: Clone & Configure
1.  Download this repository.
2.  Navigate to `backend/`.
3.  Create a file named `.env` and add your MongoDB connection string:
    ```env
    MONGODB_URI=mongodb+srv://your_user:your_password@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority
    ```

### Step 2: Install Dependencies
Open a terminal in the `backend/` folder:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 3: Run the App
**Option A (Windows - Easiest)**:
*   Double-click `start_veo.bat`.

**Option B (Manual)**:
1.  Start Backend: `python backend/app.py`
2.  Open Frontend: Open `frontend/index.html` in your browser.

---

## 📖 How to Use

1.  **API Setup**: Click the "API Settings" dropdown in the UI. Enter your (Free) Hugging Face Token and Google Gemini API Key.
2.  **Start a Story**: Enter a **Story Title** (Required). This groups all your scenes together.
3.  **Define Characters**: Upload images of your characters. Gemini will auto-describe them.
4.  **Consistency Rules**: Add specific rules (e.g., "Always wears a red scarf") to ensure continuity.
5.  **Generate**: Click "Generate Prompt".
    *   *Result*: A new scene is added to your Story in the database, and a professional prompt is generated for Veo.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
