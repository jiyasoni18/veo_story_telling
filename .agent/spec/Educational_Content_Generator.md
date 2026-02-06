# Educational/Health Content Generator - Specification

## 🎯 Feature Overview

Generate complete video prompts for educational health content with:
- Visual descriptions (microscopic/scientific scenes)
- Dialogue in multiple languages (Hindi, English, etc.)
- Audio style specifications
- Lip-sync data
- Background music descriptions

## 📋 User Inputs

### **Required Fields:**

1. **Character Name** (e.g., "Sugar", "Vitamin C", "Protein")
2. **Voice Tone** (e.g., "angry", "friendly", "educational", "warning")
3. **Topic Type** 
   - Health Benefit
   - Side Effect / Warning
4. **Dialogue Language**
   - Hindi (Devanagari)
   - English
   - Other languages
5. **Duration** (dropdown)
   - 8 seconds
   - 16 seconds
   - 24 seconds
   - 32 seconds
   - 40 seconds
   - 48 seconds
   - 56 seconds

### **Optional Fields:**

6. **Custom Topic** (text input for specific health topic)
7. **Target Audience** (Kids, Adults, Medical Professionals)

## 📝 Output Format

### **Complete Prompt Structure:**

```
Visual Prompt:
[Detailed microscopic/scientific scene description with character animation]

Dialogue ([LANGUAGE]):
[Dialogue text in specified language]

[SCENE METADATA]
Duration: [X] seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: [Description]. Pitch/Timbre: [voice_type]. Emotion: [emotion].
Background: [Background music/sound description]

[LIP SYNC DATA]
0.0s-[X]s
Speaker: [character_name]
Voice ID: [character]_[voice_type]
Lip Sync Target: [character]_face_mesh
Text: "[Dialogue text]"
```

## 🎨 Example Outputs

### **Example 1: Sugar (Warning - Hindi)**

**User Input:**
- Character: Sugar
- Voice Tone: Angry
- Topic: Side Effect
- Language: Hindi
- Duration: 8 seconds

**Generated Output:**
```
Visual Prompt:
The scene opens with a dark, pulsating microscopic view inside a human vein. The vein walls appear slightly rough and discolored. Tiny, sharp-edged sugar crystals are visible, some gently floating, others slowly adhering to the vein lining, starting to form a sticky, irregular plaque. The main Sugar character, a larger, animated sugar crystal, floats menacingly in the center of the vein. Its form shimmers with a dark, angry energy, and its face is set in a severe, commanding scowl. As it speaks, it slowly extends one hand, and with a subtle, authoritative gesture, the existing sugar particles clump together more aggressively, visibly thickening a section of the blood flow. A faint, dark red glow pulses from the character, emphasizing its stern warning and the immediate, internal damage it's causing. The blood flow in the vein becomes noticeably more sluggish and viscous around the accumulating particles.

Dialogue (HINDI (Devanagari)):
हद से ज़्यादा मिठास? अब देखो क्या करता हूँ! तेरी रगों में जम रहा हूँ, ख़ून गाढ़ा कर रहा हूँ. ये तेरी ही ग़लती है!

[SCENE METADATA]
Duration: 8 seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: Deep, resonant, strong MALE voice. Pitch/Timbre: male_deep. Emotion: angry.
Background: Consistent ambient. A low, ominous hum with a subtle, rhythmic throb that mimics a struggling internal organ.

[LIP SYNC DATA]
0.0s-8.0s
Speaker: sugar
Voice ID: sugar_male_deep
Lip Sync Target: sugar_face_mesh
Text: "हद से ज़्यादा मिठास? अब देखो क्या करता हूँ! तेरी रगों में जम रहा हूँ, ख़ून गाढ़ा कर रहा हूँ. ये तेरी ही ग़लती है!"
```

### **Example 2: Vitamin C (Benefit - English)**

**User Input:**
- Character: Vitamin C
- Voice Tone: Friendly
- Topic: Health Benefit
- Language: English
- Duration: 8 seconds

**Generated Output:**
```
Visual Prompt:
The scene opens with a bright, vibrant microscopic view inside a human cell. The cell walls glow with a healthy, translucent sheen. The main Vitamin C character, a radiant, glowing orange sphere with a warm, friendly face, floats gracefully in the center. Its form pulses with bright, golden energy, and its expression is cheerful and encouraging. As it speaks, it extends both hands, and with gentle, flowing gestures, small particles of light emanate from its body, spreading throughout the cell. These light particles visibly strengthen the cell walls, making them more robust and vibrant. A soft, warm glow radiates from the character, emphasizing its beneficial effects. The cellular environment becomes noticeably brighter and more energetic.

Dialogue (ENGLISH):
Hey there! I'm Vitamin C, your immune system's best friend! I strengthen your cells, fight off infections, and keep you healthy and strong. Let's boost that immunity together!

[SCENE METADATA]
Duration: 8 seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: Warm, friendly, upbeat FEMALE voice. Pitch/Timbre: female_bright. Emotion: cheerful.
Background: Consistent ambient. A light, uplifting melody with gentle chimes and soft, positive tones.

[LIP SYNC DATA]
0.0s-8.0s
Speaker: vitamin_c
Voice ID: vitamin_c_female_bright
Lip Sync Target: vitamin_c_face_mesh
Text: "Hey there! I'm Vitamin C, your immune system's best friend! I strengthen your cells, fight off infections, and keep you healthy and strong. Let's boost that immunity together!"
```

### **Example 3: Protein (Educational - Hindi)**

**User Input:**
- Character: Protein
- Voice Tone: Educational
- Topic: Health Benefit
- Language: Hindi
- Duration: 16 seconds

**Generated Output:**
```
Visual Prompt:
The scene opens with a detailed microscopic view inside a muscle fiber. The muscle tissue appears structured and organized. The main Protein character, a strong, muscular humanoid figure made of interlocking amino acid chains, stands confidently in the center. Its form is solid and powerful, with a calm, knowledgeable expression. As it speaks, it flexes its arms, and the amino acid chains visibly connect and strengthen, forming robust muscle fibers. The character gestures to the surrounding tissue, and with each movement, the muscle fibers grow thicker and more defined. A steady, blue-white glow emanates from the character, symbolizing strength and growth. The muscle tissue becomes noticeably more developed and powerful throughout the scene.

Dialogue (HINDI (Devanagari)):
नमस्ते! मैं प्रोटीन हूँ, तुम्हारी मांसपेशियों का निर्माता। मैं तुम्हारे शरीर को मजबूत बनाता हूँ, मांसपेशियों की मरम्मत करता हूँ, और तुम्हें ऊर्जा देता हूँ। रोज़ाना पर्याप्त प्रोटीन लो और देखो कैसे तुम्हारा शरीर मजबूत होता है!

[SCENE METADATA]
Duration: 16 seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: Strong, clear, authoritative MALE voice. Pitch/Timbre: male_medium. Emotion: educational.
Background: Consistent ambient. A steady, rhythmic pulse with subtle orchestral undertones, conveying strength and stability.

[LIP SYNC DATA]
0.0s-16.0s
Speaker: protein
Voice ID: protein_male_medium
Lip Sync Target: protein_face_mesh
Text: "नमस्ते! मैं प्रोटीन हूँ, तुम्हारी मांसपेशियों का निर्माता। मैं तुम्हारे शरीर को मजबूत बनाता हूँ, मांसपेशियों की मरम्मत करता हूँ, और तुम्हें ऊर्जा देता हूँ। रोज़ाना पर्याप्त प्रोटीन लो और देखो कैसे तुम्हारा शरीर मजबूत होता है!"
```

## 🎯 AI Generation Rules

### **Visual Prompt Generation:**

1. **Setting**: Always microscopic/cellular level
2. **Character Design**: Anthropomorphized version of the substance
3. **Animation**: Character gestures matching dialogue
4. **Effects**: Visual representation of health impact
5. **Color Scheme**: 
   - Benefits: Bright, warm colors (gold, orange, green)
   - Side Effects: Dark, warning colors (red, dark purple, black)

### **Dialogue Generation:**

1. **Length**: Adjust to duration (8s = ~30-40 words, 16s = ~60-80 words)
2. **Tone**: Match voice tone (angry, friendly, educational)
3. **Language**: Generate in specified language
4. **Content**: 
   - Benefits: Positive, encouraging, informative
   - Side Effects: Warning, cautionary, serious

### **Audio Style:**

1. **Voice Type**:
   - Angry/Warning: Deep male (male_deep)
   - Friendly/Benefit: Bright female (female_bright)
   - Educational: Medium male/female (male_medium, female_medium)

2. **Background Music**:
   - Benefits: Uplifting, positive tones
   - Side Effects: Ominous, warning tones
   - Educational: Steady, neutral tones

### **Lip Sync Data:**

1. **Timing**: 0.0s to [duration]s
2. **Speaker**: Character name (lowercase)
3. **Voice ID**: [character]_[voice_type]
4. **Target**: [character]_face_mesh
5. **Text**: Exact dialogue text

## 🎨 Character Library Examples

### **Common Health Characters:**

1. **Sugar** (Warning)
   - Visual: Sharp crystals, dark energy
   - Voice: Deep male, angry
   - Effect: Blood thickening, plaque formation

2. **Vitamin C** (Benefit)
   - Visual: Glowing orange sphere, warm light
   - Voice: Bright female, cheerful
   - Effect: Cell strengthening, immunity boost

3. **Protein** (Benefit)
   - Visual: Muscular amino acid chains
   - Voice: Medium male, educational
   - Effect: Muscle building, tissue repair

4. **Sodium/Salt** (Warning)
   - Visual: White crystals, pulsing red
   - Voice: Deep male, warning
   - Effect: Blood pressure increase

5. **Fiber** (Benefit)
   - Visual: Green, flowing strands
   - Voice: Calm female, friendly
   - Effect: Digestive health, cleansing

6. **Trans Fat** (Warning)
   - Visual: Sticky, dark blobs
   - Voice: Deep male, menacing
   - Effect: Artery clogging

## 📊 Duration Guidelines

| Duration | Word Count | Dialogue Complexity |
|----------|-----------|---------------------|
| 8s | 30-40 words | Simple, direct message |
| 16s | 60-80 words | Moderate detail |
| 24s | 90-120 words | Detailed explanation |
| 32s | 120-160 words | Comprehensive info |
| 40s | 150-200 words | In-depth discussion |
| 48s | 180-240 words | Extended explanation |
| 56s | 210-280 words | Full educational segment |

## 🌍 Language Support

### **Supported Languages:**

1. **Hindi (Devanagari)** - हिंदी
2. **English** - English
3. **Spanish** - Español
4. **French** - Français
5. **German** - Deutsch
6. **Arabic** - العربية
7. **Chinese** - 中文
8. **Japanese** - 日本語

## 🎬 Implementation Plan

### **Backend API Endpoint:**

```
POST /api/v1/educational/generate-prompt
```

**Request Body:**
```json
{
  "character_name": "Sugar",
  "voice_tone": "angry",
  "topic_type": "side_effect",
  "language": "hindi",
  "duration": 8,
  "custom_topic": "diabetes risk" (optional)
}
```

**Response:**
```json
{
  "visual_prompt": "...",
  "dialogue": "...",
  "metadata": {
    "duration": 8,
    "aspect_ratio": "9:16"
  },
  "audio_style": {
    "voice": "...",
    "background": "..."
  },
  "lip_sync_data": {
    "timing": "0.0s-8.0s",
    "speaker": "sugar",
    "voice_id": "sugar_male_deep",
    "target": "sugar_face_mesh",
    "text": "..."
  }
}
```

This feature will enable quick generation of educational health content with professional formatting!
