"""
Add multiple character dialogue assignment requirement to gemini.py
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the line "3. Use ONLY character names from the CHARACTER LIBRARY above"
# and insert the multiple characters requirement before it

old_text = """3. Use ONLY character names from the CHARACTER LIBRARY above
4. Reference character visual traits AND voice characteristics in scene descriptions
5. Follow the NARRATOR MODE rules strictly
6. For "narrator_with_visuals" mode: ALWAYS include BOTH narrator_text AND character dialogue
7. Identify the LOCATION for each scene (e.g., forest, temple, city, cave, mountain, etc.)
8. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions
9. Each scene description must be STANDALONE (understandable without other scenes)"""

new_text = """3. MULTIPLE CHARACTERS IN SCENE:
   - If 2+ characters are in a scene, assign dialogue to the CORRECT character
   - Each character should have their OWN dialogue (don't give all dialogue to one character)
   - Clearly identify WHO is speaking WHAT
   - Example: If Shatbuddhi and Sahastrabuddhi are both present:
     * Shatbuddhi gets Shatbuddhi's dialogue
     * Sahastrabuddhi gets Sahastrabuddhi's dialogue
     * Don't give both dialogues to just one fish!
4. Use ONLY character names from the CHARACTER LIBRARY above
5. Reference character visual traits AND voice characteristics in scene descriptions
6. Follow the NARRATOR MODE rules strictly
7. For "narrator_with_visuals" mode: ALWAYS include BOTH narrator_text AND character dialogue
8. Identify the LOCATION for each scene (e.g., forest, temple, city, cave, mountain, etc.)
9. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions
10. Each scene description must be STANDALONE (understandable without other scenes)"""

content = content.replace(old_text, new_text)

# Also add an example after the JSON structure
old_json_end = """  ]
}}

IMPORTANT NARRATOR MODE RULES:"""

new_json_end = """  ]
}}

MULTIPLE CHARACTERS EXAMPLE:
{{
  "scene_number": 2,
  "narrator_text": "दोनों मछलियां आपस में बात कर रही थी",
  "characters": [
    {{ "name": "Shatbuddhi", "dialogue": "हमें यहां से भागना चाहिए" }},
    {{ "name": "Sahastrabuddhi", "dialogue": "नहीं हम यहीं रहेंगे" }}
  ]
}}
NOTE: Each character gets their OWN dialogue, not both dialogues to one character!

IMPORTANT NARRATOR MODE RULES:"""

content = content.replace(old_json_end, new_json_end)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added multiple character dialogue assignment requirement")
print("📝 Updated CRITICAL REQUIREMENTS section")
print("📝 Added MULTIPLE CHARACTERS EXAMPLE")
print("🔧 Server will auto-reload")
