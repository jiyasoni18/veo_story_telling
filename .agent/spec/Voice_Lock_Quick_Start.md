# 🚀 Voice Lock - Quick Start Guide

## ✅ **Implementation Complete!**

The voice-locking system is **fully implemented and tested** in your backend!

---

## 🎯 **What You Have Now**

✅ **Voice Lock Service** - Generates Voice Anchor Blocks  
✅ **API Endpoints** - Ready to use  
✅ **Voice Presets** - 6 character archetypes  
✅ **Ambient Sounds** - 30+ locations  
✅ **Test Suite** - All tests passing  

---

## 🔥 **Quick Test (5 Minutes)**

### **Step 1: Start Backend**

```bash
cd backend
python -m uvicorn app:app --reload
```

### **Step 2: Test Voice-Locked Prompt Generation**

Use this cURL command (replace `YOUR_TOKEN` with your actual auth token):

```bash
curl -X POST http://localhost:8000/api/v1/ai/generate-voice-locked-prompt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scene_data": {
      "description": "She stands at the edge of a dark forest, hand on sword",
      "location": "forest",
      "characters": [{"name": "Aria", "dialogue": "I must find the crystal"}],
      "camera_angle": "Wide shot"
    },
    "characters": {
      "Aria": {
        "name": "Aria",
        "age_range": "late 20s",
        "vocal_quality": "clear, determined alto voice",
        "speaking_style": "steady and purposeful tone",
        "accent": "soft Irish accent",
        "emotional_baseline": "quiet courage and underlying vulnerability"
      }
    }
  }'
```

### **Step 3: See Voice-Locked Prompt**

You'll get a response like:

```json
{
  "success": true,
  "prompt": "Wide shot. Aria, a person in their late 20s, with a clear, determined alto voice, steady and purposeful tone, soft Irish accent, speaks with quiet courage and underlying vulnerability. She stands at the edge of a dark forest, hand on sword. Aria says: \"I must find the crystal\". Close-mic, clean audio, warm tone, no reverb. Ambient sound: rustling leaves, distant bird calls, wind through branches. Cinematic lighting, professional composition, shallow depth of field. No subtitles.",
  "voice_locked": true,
  "location": "forest",
  "ambient_sound": "rustling leaves, distant bird calls, wind through branches"
}
```

**That's it!** Your voice-locked prompt is ready for Veo 3.1! 🎬

---

## 📋 **Available Endpoints**

### **1. Generate Voice-Locked Prompt**
```
POST /api/v1/ai/generate-voice-locked-prompt
```

**Use**: Generate complete voice-locked prompts for scenes

---

### **2. Get Voice Presets**
```
GET /api/v1/ai/voice-presets
```

**Use**: Get 6 ready-made character voice configurations

---

## 🎭 **Voice Presets Available**

Just call `/voice-presets` to get:

1. **wise_mentor** - Deep, British, ancient wisdom
2. **young_hero** - Bright, American, optimistic
3. **mysterious_stranger** - Raspy, Eastern European, intense
4. **child_character** - High-pitched, innocent, curious
5. **villain** - Cold whisper, menacing, dark
6. **narrator** - Smooth, authoritative, professional

---

## 📖 **Character Voice Structure**

When creating characters, include these fields:

```json
{
  "name": "Character Name",
  "age_range": "late 20s",
  "vocal_quality": "clear, warm voice",
  "speaking_style": "confident tone",
  "accent": "neutral accent",
  "emotional_baseline": "calm presence"
}
```

**Defaults are provided** if fields are missing!

---

## 🌍 **Supported Locations (30+)**

The system knows ambient sounds for:

- **Nature**: forest, mountain, ocean, beach, garden
- **Buildings**: temple, castle, palace, library, office
- **Fantasy**: cave, dungeon, void
- **Sci-Fi**: spaceship, laboratory
- **Urban**: city, street, market, tavern
- **And more!**

---

## 🎬 **Example: 3-Scene Story**

### **Scene 1** (Forest):
```json
{
  "scene_data": {
    "description": "She stands at forest edge, determined",
    "location": "forest",
    "characters": [{"name": "Aria", "dialogue": "The quest begins"}],
    "camera_angle": "Wide shot"
  },
  "characters": { "Aria": { ... } }
}
```

### **Scene 2** (Temple):
```json
{
  "scene_data": {
    "description": "She kneels before ancient altar",
    "location": "temple",
    "characters": [{"name": "Aria", "dialogue": "I am worthy"}],
    "camera_angle": "Close-up"
  },
  "characters": { "Aria": { ... } }
}
```

### **Scene 3** (Temple):
```json
{
  "scene_data": {
    "description": "She holds glowing crystal aloft",
    "location": "temple",
    "characters": [{"name": "Aria", "dialogue": "Victory is mine"}],
    "camera_angle": "Medium shot"
  },
  "characters": { "Aria": { ... } }
}
```

**Result**: All 3 scenes have **identical Voice Anchor Blocks** → Perfect voice consistency! ✅

---

## 🧪 **Run Tests**

Verify everything works:

```bash
cd backend
python test_voice_lock.py
```

**Expected**: All 6 tests pass ✅

---

## 📚 **Full Documentation**

Located in `.agent/spec/`:

- **README_Voice_Lock.md** - Start here
- **Voice_Lock_Quick_Reference.md** - Templates
- **Complete_Story_Example.md** - Full example
- **Voice_Lock_Implementation_Progress.md** - Complete summary

---

## 🎯 **Next Steps**

### **Option 1: Test Now**
- Start backend
- Test endpoints
- See voice-locked prompts

### **Option 2: Build Frontend**
- Add voice input fields
- Integrate with backend
- Complete UI

### **Option 3: Use Manually**
- Call API directly
- Build prompts
- Copy to Veo 3.1

---

## 💡 **Key Benefits**

✅ **Consistent Voices** - Same character, same voice, every scene  
✅ **Professional Quality** - Veo 3.1 best practices built-in  
✅ **No External Tools** - Pure prompt engineering  
✅ **30+ Locations** - Ambient sounds ready  
✅ **6 Presets** - Quick character setup  
✅ **Tested & Working** - All tests passing  

---

## 🎉 **You're Ready!**

The voice-locking system is **complete and working**!

**Start testing now** or **let me know if you need help with the frontend!** 🚀

---

**Questions?** Just ask! I'm here to help. 🎬✨
