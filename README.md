# 🎬 Veo Ultimate - Gemini Vision Edition

A powerful AI-powered video prompt generator for Google's Veo 3, featuring intelligent character analysis with Google Gemini AI and automatic visual style detection.

![Visual Style Workflow](visual_style_workflow_1769682812312.png)

## ✨ Features

### 🔮 **AI-Powered Character Analysis**

- Upload character images and get instant AI analysis
- Powered by Google Gemini 2.5 Flash (FREE)
- Analyzes 12 character parameters automatically
- 1500 free requests per day

### 🎨 **Visual Style Detection**

- **Automatic style detection** from uploaded images
- Supports 7 visual styles:
  - 📸 Photorealistic / Cinematic
  - 🧸 3D Animation (Pixar/Disney Style)
  - 🎌 2D Anime / Manga Style
  - 🤖 Digital Avatar / AI Character
  - 🌃 Cyberpunk / Futuristic
  - 🎨 Oil Painting / Artistic
  - 🎞️ Vintage Film Look
- **Style enforcement** across all scenes for perfect consistency

### 🔒 **Character Consistency Mode**

- Maintains character appearance across multiple scenes
- Stores character descriptions and voice types
- Enforces consistency rules automatically
- Perfect for creating multi-scene stories

### 🎙️ **Voice Control**

- 9 voice types (deep male, soft female, child, elderly, divine, etc.)
- Voice type memory for each character
- Automatic voice assignment in prompts

### 🎬 **Scene Management**

- Multiple scene types (dialogue, scene change, action)
- Seamless transitions or fade to black
- Scene numbering and duration control
- Environment and lighting presets

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- Google Gemini API Key (FREE) - [Get it here](https://aistudio.google.com/app/apikey)
- Hugging Face API Token (FREE) - [Get it here](https://huggingface.co/settings/tokens)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/priyanshi496/veo-prompt-generator.git
cd veo-prompt-generator
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Start the backend server**

```bash
python3 server.py
```

4. **Start the frontend server** (in a new terminal)

```bash
python3 -m http.server 8000
```

5. **Open in browser**

```
http://localhost:8000/veo.html
```

## 📖 Usage

### Step 1: Configure API Keys

1. Click "🔑 API Settings" to expand
2. Enter your Hugging Face API token
3. Enter your Google Gemini API key
4. Select your preferred LLM model

### Step 2: Upload Character Image

1. Click "📸 Upload Character Image"
2. Select an image of your character
3. Click "🔮 Analyze with Gemini"
4. AI will automatically:
   - Detect the visual style
   - Generate character description
   - Set the visual style dropdown

### Step 3: Fill Scene Details

1. Enter scene description
2. Select duration and scene number
3. Choose scene type (dialogue/scene change/action)
4. Visual style is auto-selected (or choose manually)

### Step 4: Add Character Details

1. Enter character name
2. Select voice type
3. Add consistency rules (optional)
4. Add dialogue and emotion

### Step 5: Generate Prompt

1. Click "✨ Generate Veo Prompt"
2. Copy the generated prompt
3. Use it in Google Veo 3 to create your video!

## 🎯 Use Cases

### Animated Story Series

Upload a Pixar-style character → AI detects "3D Animation" → All scenes maintain consistent 3D aesthetic

### Historical Drama

Upload an oil painting → AI detects "Oil Painting Art Style" → Entire story has painterly, artistic look

### Anime Series

Upload anime character → AI detects "2D Anime Style" → Consistent anime/manga aesthetic throughout

### Photorealistic Film

Upload real photo → AI detects "Cinematic Photorealism" → Professional, realistic video style

## 📁 Project Structure

```
veo-prompt-generator/
├── server.py                    # Flask backend with Gemini integration
├── veo.html                     # Main frontend application
├── veo_apikey.js               # API key management
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
├── VISUAL_STYLE_FEATURE.md    # Feature documentation
└── TESTING_GUIDE.md           # Testing instructions
```

## 🔧 Technical Details

### Backend (server.py)

- **Flask** web server
- **Google Gemini 2.5 Flash** for image analysis
- **Hugging Face** LLM integration (Llama 3.3, Qwen 2.5, Phi 3.5)
- Automatic visual style detection
- Character description extraction

### Frontend (veo.html)

- Pure HTML/CSS/JavaScript
- Modern dark theme with gold accents
- Responsive design
- Real-time form validation
- Character memory system
- Visual style auto-selection

## 🎨 Visual Style Detection

The AI analyzes uploaded images and detects:

1. **Character Details**: Skin tone, eyes, hair, clothing, etc. (12 parameters)
2. **Visual Style**: Photorealistic, 3D, anime, oil painting, etc.

Both are automatically filled in the form, saving you time!

## 🔒 Character Consistency

The app remembers:

- Character descriptions
- Voice types
- Consistency rules
- Visual style

This ensures perfect continuity across all scenes in your story.

## 📊 API Usage

### Free Tier Limits

- **Google Gemini**: 1500 requests/day (FREE)
- **Hugging Face**: Generous free tier with rate limits

### Models Supported

- Llama 3.3 70B (Best Quality)
- Qwen 2.5 72B (Great Alternative)
- Phi 3.5 Mini (Faster)

## 🐛 Troubleshooting

### Server won't start

```bash
# Kill any process using port 5001
lsof -ti:5001 | xargs kill -9
python3 server.py
```

### API Key Issues

- Verify your Gemini key at [AI Studio](https://aistudio.google.com/app/apikey)
- Verify your HF token at [Hugging Face](https://huggingface.co/settings/tokens)
- Make sure keys are entered correctly (no extra spaces)

### Style Detection Not Working

- Ensure image is clear and high quality
- Try with different image types
- Check server console for error messages
- Manually select style if AI detection fails

## 📚 Documentation

- [Visual Style Feature Guide](VISUAL_STYLE_FEATURE.md)
- [Testing Guide](TESTING_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Priyanshi Modi**

- GitHub: [@priyanshi496](https://github.com/priyanshi496)
- Email: priyanshimodi21@gmail.com

## 🙏 Acknowledgments

- Google Gemini AI for powerful image analysis
- Hugging Face for LLM infrastructure
- Google Veo 3 for video generation capabilities

## 🌟 Star History

If you find this project helpful, please consider giving it a star! ⭐

---

**Made with ❤️ for the AI video generation community**
