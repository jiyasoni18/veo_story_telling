# Background Integration in Veo Prompts

## ✅ Implementation Complete

### 🎯 What Changed

The prompt generation system now **automatically extracts and integrates background/setting details** from the story context and scene description, ensuring Veo 3.1 generates videos with appropriate environments that match the narrative.

### 🏛️ Background Integration Rules

#### **Rule #1: Background & Setting Integration**
```
- Analyze STORY CONTEXT and SCENE DESCRIPTION to determine setting
- Include specific background details in final prompt
- Describe architectural elements, natural features, or environmental details
- Ensure background matches story's time period and location
- Maintain background consistency if same location appears in multiple scenes
```

### 📋 Background Categories & Examples

#### **1. Architecture (Palaces, Buildings, Monuments)**
```
Examples:
- "Grand palace entrance with marble pillars and gold-trimmed arches"
- "Ancient temple with stone carvings and towering columns"
- "Modern skyscraper lobby with glass walls and polished floors"
- "Medieval castle courtyard with cobblestone ground and ivy-covered walls"
```

#### **2. Nature (Forests, Mountains, Beaches)**
```
Examples:
- "Dense forest with towering oak trees and dappled sunlight"
- "Mountain peak with snow-capped ridges and clear blue sky"
- "Sandy beach with rolling waves and palm trees swaying"
- "Flower meadow with wildflowers and distant hills"
```

#### **3. Interior (Rooms, Halls, Chambers)**
```
Examples:
- "Luxurious bedroom with silk curtains and antique furniture"
- "Grand throne room with red carpet and ornate chandeliers"
- "Cozy library with wooden bookshelves and leather armchairs"
- "Modern kitchen with stainless steel appliances and marble countertops"
```

#### **4. Urban (Streets, Cities, Markets)**
```
Examples:
- "Bustling city street with neon signs and modern skyscrapers"
- "Traditional marketplace with colorful stalls and hanging lanterns"
- "Quiet suburban neighborhood with tree-lined sidewalks"
- "Industrial district with brick warehouses and metal fire escapes"
```

### 📝 Prompt Structure with Background

#### **New 5-Part Structure (200-300 words):**

```
1. Opening: Camera angle, transition, and setting/background (30-50 words)
   Example: "A cinematic medium shot fades in, revealing the grand palace 
            entrance with towering marble pillars and gold-trimmed arches..."

2. Character Description: Visual traits, clothing, positioning (80-120 words)
   Example: "Rohan stands in the center, maintaining his exact appearance: 
            warm olive skin, ornate turban with golden ornament..."

3. Action & Dialogue: What happens, what's said with lip-sync (40-60 words)
   Example: "He steps forward with confident posture and speaks: 'Welcome 
            home, my friend.' [TECHNICAL: Lip-sync active for Rohan]..."

4. Background Details: Environmental elements, architecture (30-50 words)
   Example: "The palace entrance features intricate wall carvings depicting 
            historical scenes, with ornate bronze doors flanked by stone 
            lion statues..."

5. Technical: Lighting, camera movement, atmosphere (20-30 words)
   Example: "Golden hour sunlight streams through the arches, creating 
            dramatic shadows. The camera remains steady, capturing the 
            grandeur of the setting."
```

### 🎬 Example: Before vs After

#### **Before (No Background Details):**
```
A medium shot of Rohan speaking at an entrance. He wears a turban and 
traditional clothing. He says "Welcome home, my friend." Dramatic lighting.
```
*Generic, no environmental context*

#### **After (With Background Integration):**
```
A cinematic medium shot fades in, revealing the grand palace entrance 
with towering marble pillars adorned with gold-trimmed arches and 
intricate floral patterns. Rohan stands centered in the frame, 
maintaining his exact appearance: warm olive skin, deep brown eyes, 
ornate turban with golden ornament and green feather accent, rich 
maroon traditional garment with gold embroidery, and multiple pearl 
necklaces. He steps forward with confident posture and speaks with 
emotional tone: "Welcome home, my friend." [TECHNICAL: Lip-sync active 
for Rohan]. His mouth movements synchronize precisely with each word. 
The palace entrance features ornate bronze doors flanked by stone lion 
statues, with detailed wall carvings depicting historical battle scenes. 
Golden hour sunlight streams through the arches, casting dramatic shadows 
across the marble floor and illuminating the intricate architectural 
details. The camera remains steady and professional, framing Rohan 
against the magnificent palace backdrop.
```
*Vivid, specific, with rich environmental context*

### 🏗️ Background Consistency Across Scenes

#### **Same Location = Same Background**

**Scene 1: Palace Entrance**
```
Background: Grand palace entrance with marble pillars, gold-trimmed 
arches, bronze doors, stone lion statues
```

**Scene 2: Palace Entrance (Later)**
```
Background: SAME grand palace entrance with SAME marble pillars, 
SAME gold-trimmed arches, SAME bronze doors, SAME stone lion statues
```

**Scene 3: Palace Interior**
```
Background: NEW - Palace throne room with red carpet, ornate chandeliers, 
gold throne, silk tapestries
```

**Scene 4: Palace Interior (Later)**
```
Background: SAME palace throne room with SAME red carpet, SAME chandeliers, 
SAME gold throne, SAME silk tapestries
```

### 📊 Background Extraction Process

#### **How AI Determines Background:**

**Input Story Context:**
```
"Rohan walked through the palace gates, admiring the ancient architecture."
```

**AI Extracts:**
- **Location**: Palace
- **Specific Area**: Gates/Entrance
- **Style**: Ancient architecture
- **Details**: Implied grandeur, historical significance

**Generated Background:**
```
"Ancient palace entrance with weathered stone gates, towering archways 
carved with historical motifs, and aged marble pillars showing centuries 
of craftsmanship"
```

### 🎨 Background Detail Levels

#### **Level 1: Basic (Minimal)**
```
"Palace entrance"
```
*Too vague for Veo*

#### **Level 2: Moderate (Acceptable)**
```
"Grand palace entrance with marble pillars"
```
*Better, but could be more specific*

#### **Level 3: Detailed (Optimal)**
```
"Grand palace entrance with towering marble pillars adorned with 
gold-trimmed arches, ornate bronze doors, and stone lion statues"
```
*Perfect for Veo 3.1*

#### **Level 4: Excessive (Too Much)**
```
"Grand palace entrance with exactly 12 white marble pillars each 
measuring 8 meters tall with Corinthian capitals featuring acanthus 
leaf designs, gold-trimmed pointed arches with filigree patterns..."
```
*Too detailed, may confuse Veo*

### 🌍 Time Period & Location Matching

#### **Historical Period:**
```
Story: "Medieval kingdom"
Background: "Stone castle with torches, wooden drawbridge, and 
           iron-studded doors"
NOT: "Modern palace with glass walls and LED lighting"
```

#### **Geographic Location:**
```
Story: "Indian palace"
Background: "Ornate palace with Mughal architecture, marble inlay 
           work, and lotus-shaped domes"
NOT: "European castle with Gothic spires and stained glass windows"
```

#### **Cultural Context:**
```
Story: "Traditional ceremony"
Background: "Temple courtyard with oil lamps, flower garlands, and 
           incense smoke"
NOT: "Modern event hall with spotlights and digital screens"
```

### 🔄 Background Continuity Examples

#### **Example 1: Forest Journey**

**Scene 1:**
```
"Dense forest with towering oak trees, thick undergrowth, and dappled 
sunlight filtering through the canopy"
```

**Scene 2 (Same Forest):**
```
"SAME dense forest with SAME towering oak trees, continuing through 
the thick undergrowth with dappled sunlight"
```

**Scene 3 (Forest Clearing):**
```
"Forest clearing surrounded by the same oak trees, with open sky above 
and wildflowers covering the ground"
```

#### **Example 2: Palace Sequence**

**Scene 1: Exterior**
```
"Grand palace exterior with white marble facade, golden domes, and 
ornate entrance gates"
```

**Scene 2: Entrance**
```
"Palace entrance hall with marble floors, crystal chandeliers, and 
walls adorned with silk tapestries"
```

**Scene 3: Throne Room**
```
"Palace throne room with elevated golden throne, red velvet carpet, 
and tall windows overlooking the gardens"
```

### ✅ Quality Checklist

A well-integrated background should have:

- [ ] Specific location type (palace, forest, city, etc.)
- [ ] Architectural or natural features described
- [ ] Colors and materials mentioned
- [ ] Scale indicated (towering, vast, intimate, etc.)
- [ ] Atmospheric details (lighting, weather, ambiance)
- [ ] Cultural/historical context if relevant
- [ ] Consistency with previous scenes if same location
- [ ] 30-50 words dedicated to background details

### 🎯 Background Integration Benefits

1. **Richer Visuals**: Veo generates more detailed environments
2. **Story Coherence**: Settings match the narrative context
3. **Visual Consistency**: Same locations look the same across scenes
4. **Immersion**: Viewers feel transported to the story world
5. **Professional Quality**: Videos look cinematically crafted
6. **Context Clarity**: Viewers understand where scenes take place

### 📏 Word Allocation

**Total Prompt: 200-300 words**

**Breakdown:**
- Opening (with background): 30-50 words (15-20%)
- Character description: 80-120 words (40-50%)
- Action & dialogue: 40-60 words (20-25%)
- Background details: 30-50 words (15-20%)
- Technical: 20-30 words (10%)

### 🚀 Result

**Your prompts now include:**
- ✅ Automatic background extraction from story
- ✅ Specific architectural/natural details
- ✅ Background consistency across scenes
- ✅ Time period and location matching
- ✅ Rich environmental context
- ✅ 30-50 words dedicated to setting
- ✅ Veo 3.1 optimized descriptions

**Example Generated Prompt with Background:**
```
A cinematic wide shot fades in, revealing the grand palace courtyard 
during golden hour, with towering marble pillars supporting ornate 
gold-trimmed arches, intricate wall carvings depicting mythological 
scenes, and a central fountain with lotus sculptures. Rohan enters 
from the left, maintaining his exact appearance: warm olive skin, deep 
brown almond-shaped eyes, ornate turban with golden ornament and green 
feather accent, rich maroon traditional garment with gold embroidery, 
pearl necklaces, and red tilak mark. He walks with athletic build and 
confident posture toward the center. He speaks: "Welcome home, my 
friend." [TECHNICAL: Lip-sync active for Rohan]. His mouth articulates 
each word clearly. The courtyard features polished marble floors 
reflecting the warm light, potted plants with vibrant flowers, and 
ornate bronze lanterns hanging from the arches. Golden hour sunlight 
streams through the openings, creating dramatic shadows and highlighting 
the architectural details. The camera tracks smoothly, maintaining focus 
on Rohan while showcasing the magnificent palace setting.
```

**Veo 3.1 now generates videos with rich, story-appropriate backgrounds that enhance the narrative and maintain visual consistency!** 🎬✨
