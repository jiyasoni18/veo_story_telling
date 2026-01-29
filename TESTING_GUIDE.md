# 🧪 Testing Guide - Visual Style Feature

## Quick Test Steps

### Test 1: Manual Style Selection

1. Open `veo.html` in your browser (http://localhost:8000/veo.html)
2. Scroll to "Scene Details" section
3. Find the new "🎨 Visual Style / Character Type" dropdown
4. Select different styles and verify they appear in generated prompts
5. ✅ **Expected**: Style is included in the prompt with enforcement instructions

### Test 2: AI Style Detection (Photorealistic Image)

1. Upload a realistic photo of a person
2. Click "🔮 Analyze with Gemini"
3. ✅ **Expected**:
   - Dropdown auto-sets to "📸 Photorealistic / Cinematic"
   - Status shows: "Detected style: Cinematic Photorealism"

### Test 3: AI Style Detection (3D Animation)

1. Upload a Pixar/Disney-style 3D character image
2. Click "🔮 Analyze with Gemini"
3. ✅ **Expected**:
   - Dropdown auto-sets to "🧸 3D Animation (Pixar/Disney Style)"
   - Status shows detected style

### Test 4: AI Style Detection (Anime)

1. Upload an anime/manga character image
2. Click "🔮 Analyze with Gemini"
3. ✅ **Expected**:
   - Dropdown auto-sets to "🎌 2D Anime / Manga Style"
   - Status shows detected style

### Test 5: AI Style Detection (Oil Painting)

1. Upload a classical oil painting or artistic portrait
2. Click "🔮 Analyze with Gemini"
3. ✅ **Expected**:
   - Dropdown auto-sets to "🎨 Oil Painting / Artistic"
   - Status shows detected style

### Test 6: Full Workflow

1. Upload character image
2. Analyze with Gemini (auto-detects style)
3. Fill in scene details
4. Click "Generate Prompt"
5. ✅ **Expected**: Generated prompt includes:

   ```
   [VISUAL STYLE]
   [Selected style name]

   VISUAL STYLE: [Selected style]
   ⚠️ CRITICAL: ALL elements must match this visual style!
   ```

### Test 7: Multi-Scene Consistency

1. Generate Scene 1 with "3D Animation" style
2. Change to Scene 2
3. Keep the same visual style
4. Generate Scene 2
5. ✅ **Expected**: Both scenes maintain the same visual style

### Test 8: Manual Override

1. Upload a photorealistic image
2. Analyze (detects "Photorealistic")
3. Manually change dropdown to "Anime Style"
4. Generate prompt
5. ✅ **Expected**: Prompt uses manually selected "Anime Style"

## 🔍 What to Check in Generated Prompts

Look for these sections in the output:

```
[VISUAL STYLE]
3D Animation (Pixar/Disney Style)

...

VISUAL STYLE: 3D Animation (Pixar/Disney Style)
⚠️ CRITICAL: ALL elements (characters, environment, props, lighting) MUST match this visual style!
```

## 🐛 Troubleshooting

### Issue: Dropdown doesn't auto-set

- **Check**: Server console for "✓ Detected Visual Style: [name]"
- **Fix**: Verify Gemini API key is valid
- **Fix**: Check browser console for JavaScript errors

### Issue: Style not in prompt

- **Check**: formData includes visualStyle
- **Fix**: Refresh page and try again
- **Fix**: Check browser console for errors

### Issue: Wrong style detected

- **Solution**: This is normal - AI detection isn't perfect
- **Action**: Manually select the correct style from dropdown
- **Note**: Detection works best with clear, obvious styles

## 📊 Server Console Output

When analyzing an image, you should see:

```
=== GEMINI IMAGE ANALYSIS ===
Image size: [number] chars
Mime type: image/jpeg
Calling Gemini Flash...
Response status: 200

✓ Detected Visual Style: 3D Animation (Pixar/Disney Style)
✓ Got description: [character description]...
```

## 🎯 Success Criteria

- ✅ Dropdown appears in UI
- ✅ Manual selection works
- ✅ AI detection works for different styles
- ✅ Dropdown auto-sets after analysis
- ✅ Visual style appears in generated prompts
- ✅ Style consistency across multiple scenes
- ✅ Manual override works

## 📝 Sample Test Images

Try these types of images:

1. **Photorealistic**: Celebrity photos, professional portraits
2. **3D Animation**: Pixar characters, Disney 3D renders
3. **Anime**: Anime screenshots, manga art
4. **Oil Painting**: Classical portraits, artistic paintings
5. **Cyberpunk**: Futuristic characters with neon aesthetics
6. **Vintage**: Old black & white photos, 1950s film stills

## 🚀 Quick Start

```bash
# Server should already be running on port 5001
# If not, run:
python3 server.py

# Open in browser:
# http://localhost:8000/veo.html
```

## 💡 Tips

1. **Best Results**: Use clear, high-quality images
2. **Style Clarity**: Images with obvious artistic styles work best
3. **Override Anytime**: You can always manually change the detected style
4. **Consistency**: Keep the same style across all scenes in a story
5. **Experimentation**: Try different styles to see what works best

---

Happy Testing! 🎨✨
