# Google Veo 3.1 Optimized Prompt Generation

## ✅ Implementation Complete

### 🎯 What Changed

The prompt generation system has been **completely optimized for Google Veo 3.1** with enhanced instructions for:
- Character visual continuity across all scenes
- Voice consistency and dialogue mapping
- Proper camera angle implementation
- Smooth transition execution
- Veo 3.1-specific best practices

### 🎬 Google Veo 3.1 Optimization Rules

#### **1. Character Visual Continuity**
```
- Each character MUST look IDENTICAL to previous appearances
- Reference exact visual traits (skin tone, clothing, accessories)
- Maintain same facial features, hair/headwear, body build
- Keep clothing colors and jewelry consistent
  Example: If Rohan wears maroon garment in Scene 1, 
           he wears maroon in Scene 2, 3, 4...
```

#### **2. Voice & Dialogue Continuity**
```
- Each character has specific Voice ID and Tone
- Maintain same voice characteristics across all scenes
- Only designated character speaks their assigned dialogue
- Non-speaking characters show reactive expressions
```

#### **3. Camera Angle Implementation**
```
- Use specified camera angle (Eye level, Close-up, Wide shot, etc.)
- Ensure angle supports scene's emotional tone
- Frame characters appropriately for dialogue scenes
- Maintain spatial consistency with previous scenes
```

#### **4. Transition Execution**
```
Transition Types:
- "Cut": Clean, immediate transition
- "Fade": Smooth 0.5-1 second fade
- "Dissolve": Gradual blend between scenes
- Ensure final frame flows into next scene's opening
```

#### **5. Lip-Sync & Dialogue**
```
- Synchronize mouth movements PRECISELY with dialogue
- Include technical marker: [TECHNICAL: Lip-sync active for CharacterName]
- Show clear mouth articulation for each word
- Non-speaking characters: closed mouths, reactive expressions
```

#### **6. Veo 3.1 Best Practices**
```
- Use clear, descriptive language
- Specify exact colors, textures, and materials
- Include lighting direction and quality
- Mention character positioning and spatial relationships
- Describe background elements for context
- Keep prompt focused and actionable
```

#### **7. Continuity Enforcement**
```
- Reference STORY CONTEXT to maintain consistency
- If character appeared before, describe EXACTLY as before
- Maintain environmental consistency (same location = same appearance)
- Keep time-of-day lighting consistent within scene sequence
```

### 📋 Prompt Structure

```
TARGET: Google Veo 3.1 Video Generation
VISUAL STYLE: Cinematic Photorealism
DURATION: 8 seconds

STORY CONTEXT (Previous Scenes for Continuity):
[Summary of what happened before to maintain continuity]

CURRENT SCENE DESCRIPTION:
[What happens in this scene]

CAMERA & CINEMATOGRAPHY:
- Camera Angle: Medium shot
- Transition from Previous Scene: Fade
- Lighting: Dramatic cinematic lighting with natural shadows
- Time of Day: Golden hour
- Camera Movement: Smooth, professional (no shaky cam)

CHARACTERS IN THIS SCENE:
CHARACTER: Rohan
- Visual Traits: Warm olive skin, deep brown eyes, ornate turban...
- Voice ID: male_deep_01 (emotional)
- Dialogue to SPEAK: "Welcome home, my friend"
- Emotion: Warm, welcoming

[7 Optimization Rules Listed]

OUTPUT FORMAT:
Single cohesive technical prompt (150-250 words)
```

### 🎨 Example Generated Prompt

**Input:**
- Scene 2 of a story
- Character: Rohan (established in Scene 1)
- Dialogue: "Welcome home, my friend"
- Camera: Medium shot
- Transition: Fade from Scene 1

**Generated Veo 3.1 Prompt:**
```
A cinematic medium shot fades in from the previous scene, revealing 
Rohan standing at the grand palace entrance during golden hour. He 
maintains his exact appearance from the previous scene: warm olive 
skin with smooth texture, deep brown almond-shaped eyes, thick arched 
eyebrows, well-groomed short beard, and oval face with strong jawline. 
He wears the same ornate turban with golden ornament and green feather 
accent, and his rich maroon traditional garment with intricate gold 
embroidery on the collar and sleeves catches the warm sunlight. 
Multiple strands of pearl necklaces gleam around his neck, and the 
small red tilak mark remains visible on his forehead. His athletic 
build and upright, confident posture convey warmth as he speaks with 
emotional voice tone: "Welcome home, my friend." [TECHNICAL: Lip-sync 
active for Rohan]. His mouth movements synchronize precisely with each 
word, showing clear articulation. The dramatic lighting creates natural 
shadows that enhance the depth of the scene, while the camera remains 
steady and professional, framing Rohan from the waist up against the 
ornate palace architecture in the background.
```

### 📊 Continuity Features

#### **Character Consistency Across Scenes:**

**Scene 1:**
```
Rohan: Warm olive skin, ornate turban, maroon garment, pearl necklaces
```

**Scene 2:**
```
Rohan: SAME warm olive skin, SAME ornate turban, SAME maroon garment, 
       SAME pearl necklaces
```

**Scene 3:**
```
Rohan: SAME warm olive skin, SAME ornate turban, SAME maroon garment, 
       SAME pearl necklaces
```

#### **Voice Consistency:**

**All Scenes:**
```
Rohan: Voice ID = male_deep_01, Tone = emotional
       (Never changes across scenes)
```

#### **Camera Angle Progression:**

**Scene 1:** Wide shot (establish location)
**Scene 2:** Medium shot (character introduction)
**Scene 3:** Close-up (emotional dialogue)
**Scene 4:** Over-the-shoulder (conversation)

#### **Transition Flow:**

```
Scene 1 → [Fade] → Scene 2 → [Cut] → Scene 3 → [Dissolve] → Scene 4
```

### 🎯 Veo 3.1 Compatibility Features

#### **1. Clear Descriptive Language**
```
❌ Bad: "A man enters"
✅ Good: "Rohan, wearing his ornate turban with golden ornament and 
         maroon traditional garment, enters through the palace gates"
```

#### **2. Exact Colors & Textures**
```
❌ Bad: "Dark clothing"
✅ Good: "Rich maroon traditional garment with intricate gold embroidery"
```

#### **3. Lighting Specifications**
```
❌ Bad: "Good lighting"
✅ Good: "Dramatic cinematic lighting with natural shadows during 
         golden hour"
```

#### **4. Character Positioning**
```
❌ Bad: "Two people talking"
✅ Good: "Rohan stands in the foreground on the left, facing Priya 
         who is positioned on the right, both framed in a medium shot"
```

#### **5. Background Context**
```
❌ Bad: "Inside a building"
✅ Good: "Inside the grand palace entrance with ornate marble pillars 
         and intricate wall carvings visible in the background"
```

### 📏 Prompt Length Guidelines

**Target:** 150-250 words

**Structure:**
1. **Opening (20-30 words)**: Camera angle, transition, setting
2. **Character Description (60-100 words)**: Visual traits, clothing, positioning
3. **Action & Dialogue (40-60 words)**: What happens, what's said
4. **Technical Details (20-40 words)**: Lip-sync, lighting, camera movement
5. **Background (10-20 words)**: Environmental context

### ✨ Key Improvements

#### **Before (Generic):**
```
"A man in traditional clothing speaks at a palace entrance."
```
*Veo 3.1 might generate inconsistent character appearance*

#### **After (Veo 3.1 Optimized):**
```
"A cinematic medium shot reveals Rohan at the palace entrance, 
maintaining his exact appearance: warm olive skin, ornate turban with 
golden ornament, maroon traditional garment with gold embroidery, pearl 
necklaces, and red tilak mark. He speaks with emotional tone: 'Welcome 
home, my friend.' [TECHNICAL: Lip-sync active for Rohan]. Dramatic 
lighting creates natural shadows during golden hour."
```
*Veo 3.1 generates consistent, high-quality video*

### 🎬 Scene-to-Scene Continuity Example

#### **Scene 1: Establishing Shot**
```
Wide shot of palace exterior at golden hour. Rohan (warm olive skin, 
ornate turban with golden ornament, maroon garment with gold embroidery, 
pearl necklaces, red tilak) walks toward the entrance with confident 
posture. Dramatic lighting with long shadows. Camera slowly pushes in.
```

#### **Scene 2: Character Introduction** (Fade transition)
```
Fade from previous scene. Medium shot of Rohan at palace entrance, 
maintaining exact appearance from Scene 1: same warm olive skin, same 
ornate turban, same maroon garment, same pearl necklaces, same tilak. 
He speaks: "Welcome home, my friend." [TECHNICAL: Lip-sync active]. 
Golden hour lighting continues.
```

#### **Scene 3: Emotional Close-up** (Cut transition)
```
Cut to close-up of Rohan's face, showing same deep brown eyes, thick 
eyebrows, well-groomed beard, and warm expression. Same turban with 
golden ornament visible. He continues speaking with emotional voice. 
Lighting remains consistent with golden hour glow.
```

### 🔧 Technical Implementation

**Prompt Builder Flow:**
```python
1. Gather character traits from database
2. Get scene description and dialogue
3. Determine camera angle and transition
4. Build character block with visual traits
5. Generate Veo 3.1 optimized prompt with:
   - Character continuity rules
   - Voice consistency
   - Camera specifications
   - Transition instructions
   - Lip-sync markers
   - Lighting details
6. Return 150-250 word technical prompt
```

### ✅ Quality Checklist

A Veo 3.1 optimized prompt should have:

- [ ] Specific camera angle mentioned
- [ ] Transition type specified
- [ ] Character visual traits described in detail
- [ ] Exact clothing colors and accessories
- [ ] Voice ID and tone referenced
- [ ] Dialogue with lip-sync marker
- [ ] Lighting direction and quality
- [ ] Character positioning and spatial relationships
- [ ] Background elements described
- [ ] Continuity with previous scenes
- [ ] 150-250 word length
- [ ] Clear, actionable language

### 🚀 Result

**Your prompts are now:**
1. ✅ Fully compatible with Google Veo 3.1
2. ✅ Maintain character visual consistency across ALL scenes
3. ✅ Preserve voice characteristics throughout
4. ✅ Implement proper camera angles
5. ✅ Execute smooth transitions
6. ✅ Include precise lip-sync instructions
7. ✅ Provide vivid, specific descriptions
8. ✅ Ensure scene-to-scene continuity

**Veo 3.1 will now generate high-quality, consistent videos with proper character continuity, voice consistency, camera work, and smooth transitions!** 🎬✨
