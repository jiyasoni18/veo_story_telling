# Standalone Prompts for Veo 3.1 - No Scene References

## ✅ Critical Fix Implemented

### 🎯 Problem Identified

**Issue**: Veo doesn't understand references like "Scene 1", "continuing from previous scene", or "the same character from Scene 1" because **each prompt is processed independently**.

**Solution**: Make every prompt **100% standalone** with complete, ultra-specific character descriptions.

### 🔑 Key Principle

> **Veo processes each prompt in isolation. It has no memory of previous scenes.**

Therefore:
- ❌ DON'T reference "Scene 1", "Scene 2", "previous scene"
- ❌ DON'T say "continuing from", "the same as before"
- ✅ DO provide COMPLETE character description in EVERY prompt
- ✅ DO use ULTRA-SPECIFIC details that are hard to vary
- ✅ DO use the EXACT SAME descriptive phrases across all prompts

### 📋 New Strategy: Consistency Through Specificity

#### **Instead of Cross-Scene References:**
```
❌ Scene 2: "Continuing from Scene 1, the SAME Rohan appears..."
   (Veo doesn't understand "Scene 1" or "SAME")
```

#### **Use Ultra-Specific Standalone Descriptions:**
```
✅ Scene 1: "A man with warm olive skin, deep brown almond-shaped eyes, 
            ornate turban with golden peacock ornament and emerald green 
            feather accent, rich maroon traditional garment with intricate 
            gold lotus embroidery..."

✅ Scene 2: "A man with warm olive skin, deep brown almond-shaped eyes, 
            ornate turban with golden peacock ornament and emerald green 
            feather accent, rich maroon traditional garment with intricate 
            gold lotus embroidery..."
            
   (EXACT SAME description = consistent output)
```

### 🎨 Ultra-Specific Description Strategy

#### **Rule 1: Complete Description Every Time**

Include ALL 12 parameters in EVERY prompt:
1. Skin tone and texture
2. Eye color, shape, and expression
3. Eyebrow characteristics
4. Nose features
5. Mouth/lip appearance
6. Facial hair
7. Face shape and structure
8. Hair/headwear details
9. Clothing colors and style
10. Jewelry and ornaments
11. Distinctive marks
12. Body build and posture

#### **Rule 2: Use Unique Identifiers**

Make descriptions so specific they're hard to vary:

```
❌ Generic: "turban"
✅ Specific: "ornate turban with golden peacock ornament and emerald 
             green feather accent positioned on the right side"

❌ Generic: "traditional clothing"
✅ Specific: "rich maroon traditional garment with intricate gold lotus 
             embroidery on the collar and three gold buttons on the sleeves"

❌ Generic: "necklace"
✅ Specific: "three strands of white pearl necklaces with gold clasp"
```

#### **Rule 3: Exact Color Names**

```
❌ Avoid: "dark", "light", "bright"
✅ Use: "maroon", "golden", "emerald green", "warm olive", "deep brown"

❌ Avoid: "red clothing"
✅ Use: "rich maroon traditional garment"

❌ Avoid: "gold jewelry"
✅ Use: "three strands of white pearl necklaces with gold clasp"
```

#### **Rule 4: Precise Counts & Positions**

```
❌ Vague: "pearl necklaces"
✅ Precise: "three strands of white pearl necklaces"

❌ Vague: "feather on turban"
✅ Precise: "emerald green feather accent positioned on the right side"

❌ Vague: "buttons on sleeves"
✅ Precise: "three gold buttons on the sleeves"
```

### 📝 Example: Complete Standalone Description

**Use this level of detail in EVERY prompt:**

```
A man with warm olive skin and smooth texture, deep brown almond-shaped 
eyes conveying confidence, thick arched eyebrows, straight nose with 
defined bridge, full lips in neutral expression, well-groomed short beard. 
His face is oval-shaped with strong jawline. He wears an ornate turban 
with golden peacock ornament and emerald green feather accent positioned 
on the right side. His clothing consists of a rich maroon traditional 
garment with intricate gold lotus embroidery on the collar and three gold 
buttons on the sleeves. Three strands of white pearl necklaces with gold 
clasp adorn his neck. A small red tilak mark is visible centered on his 
forehead. He has an athletic build with broad shoulders and upright, 
confident posture.
```

**Word count**: ~120 words
**Specificity level**: Ultra-high
**Unique identifiers**: 8+ (peacock ornament, emerald feather, lotus embroidery, three buttons, three necklaces, tilak mark, etc.)

### 🔄 Consistency Through Exact Repetition

#### **Critical Rule: Copy-Paste Character Descriptions**

```
Scene 1 Prompt:
"...ornate turban with golden peacock ornament and emerald green feather 
accent..."

Scene 2 Prompt:
"...ornate turban with golden peacock ornament and emerald green feather 
accent..."
   ↑ EXACT SAME PHRASE

Scene 3 Prompt:
"...ornate turban with golden peacock ornament and emerald green feather 
accent..."
   ↑ EXACT SAME PHRASE
```

**Why this works:**
- Veo sees the exact same description
- Generates the exact same visual
- No variation = perfect consistency

### 🎬 Transition Language (Veo-Compatible)

#### **Instead of Scene References:**

```
❌ Don't say: "Continuing from Scene 1..."
❌ Don't say: "Following the previous scene..."
❌ Don't say: "The same character from before..."
```

#### **Use Transition Effects:**

```
✅ For Fade: "The scene fades in smoothly, revealing..."
✅ For Cut: "The scene opens with..."
✅ For Dissolve: "The scene dissolves into view, showing..."
```

### 📊 Prompt Structure (Standalone)

#### **Every Prompt (Scene 1, 2, 3, etc.) - Same Structure:**

```
1. Opening with Transition (30-40 words):
   "The scene [transition effect] reveals [complete setting description]..."

2. Complete Character Description (150-200 words):
   "[Full 12-parameter description with ultra-specific details]..."

3. Action & Dialogue (50-70 words):
   "[Character name] [action]. They speak: '[dialogue]' [TECHNICAL: Lip-sync]..."

4. Complete Background Details (50-70 words):
   "The [setting] features [specific architectural/natural elements]..."

5. Technical (20-30 words):
   "[Lighting]. The camera [movement]..."
```

**Total**: 300-400 words per prompt

### 🎯 Example: Scene 1 vs Scene 2

#### **Scene 1 Prompt (Standalone):**
```
The scene fades in smoothly, revealing the grand palace entrance with 
white marble pillars featuring gold-trimmed Mughal arches and ornate 
bronze doors. A man with warm olive skin and smooth texture, deep brown 
almond-shaped eyes conveying confidence, thick arched eyebrows, straight 
nose with defined bridge, full lips in neutral expression, well-groomed 
short beard stands at the entrance. His face is oval-shaped with strong 
jawline. He wears an ornate turban with golden peacock ornament and 
emerald green feather accent positioned on the right side. His clothing 
consists of a rich maroon traditional garment with intricate gold lotus 
embroidery on the collar and three gold buttons on the sleeves. Three 
strands of white pearl necklaces with gold clasp adorn his neck. A small 
red tilak mark is visible centered on his forehead. He has an athletic 
build with broad shoulders and upright, confident posture. Rohan steps 
forward and speaks: "Welcome to my home." [TECHNICAL: Lip-sync active for 
Rohan]. His mouth movements synchronize precisely with each word. The 
palace entrance features polished marble floors with geometric inlay 
patterns, stone lion statues flanking the doors, and intricate wall 
carvings depicting historical scenes. Golden hour sunlight streams through 
the arches, creating dramatic shadows. The camera slowly pushes in, 
maintaining steady framing on Rohan.
```

#### **Scene 2 Prompt (Standalone - EXACT SAME DESCRIPTION):**
```
The scene cuts to the grand palace entrance with white marble pillars 
featuring gold-trimmed Mughal arches and ornate bronze doors. A man with 
warm olive skin and smooth texture, deep brown almond-shaped eyes 
conveying confidence, thick arched eyebrows, straight nose with defined 
bridge, full lips in neutral expression, well-groomed short beard stands 
at the entrance. His face is oval-shaped with strong jawline. He wears an 
ornate turban with golden peacock ornament and emerald green feather 
accent positioned on the right side. His clothing consists of a rich 
maroon traditional garment with intricate gold lotus embroidery on the 
collar and three gold buttons on the sleeves. Three strands of white pearl 
necklaces with gold clasp adorn his neck. A small red tilak mark is 
visible centered on his forehead. He has an athletic build with broad 
shoulders and upright, confident posture. Rohan turns and speaks: "Please, 
come inside." [TECHNICAL: Lip-sync active for Rohan]. His mouth 
articulates clearly with each word. The palace entrance features polished 
marble floors with geometric inlay patterns, stone lion statues flanking 
the doors, and intricate wall carvings depicting historical scenes. Golden 
hour lighting continues, creating consistent shadows. The camera remains 
steady, tracking Rohan's movement smoothly.
```

**Notice:**
- ✅ Character description is IDENTICAL (copy-pasted)
- ✅ Background description is IDENTICAL (same location)
- ✅ NO references to "Scene 1" or "previous scene"
- ✅ Each prompt is 100% standalone
- ✅ Only the action/dialogue changes

### ✅ Quality Checklist

For EVERY prompt, verify:

- [ ] NO references to scene numbers ("Scene 1", "Scene 2")
- [ ] NO references to previous scenes ("continuing from", "the same as before")
- [ ] Complete 12-parameter character description (150-200 words)
- [ ] Ultra-specific details (exact colors, counts, positions)
- [ ] Unique identifiers (peacock ornament, lotus embroidery, etc.)
- [ ] EXACT SAME character description as other scenes
- [ ] EXACT SAME background description if same location
- [ ] Standalone transition language ("fades in", "opens with")
- [ ] 300-400 words total
- [ ] Prompt makes sense without knowing other scenes

### 🚀 Result

**Your prompts are now:**
- ✅ 100% standalone (no scene references)
- ✅ Ultra-specific (unique identifiers)
- ✅ Consistent (exact same descriptions)
- ✅ Veo-compatible (no cross-scene references)
- ✅ Detailed (300-400 words, 12 parameters)
- ✅ Repeatable (copy-paste character descriptions)

**Veo 3.1 will now generate consistent characters across all scenes because each prompt contains the EXACT SAME ultra-specific description!** 🎬✨

### 💡 Key Insight

> **Consistency comes from SPECIFICITY, not from REFERENCES.**

The more specific and unique your descriptions, the more consistent Veo's output will be—even without knowing about previous scenes.
