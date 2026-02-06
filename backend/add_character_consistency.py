"""
Add character consistency requirement to gemini.py scene breaking
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add character consistency requirement after requirement #4
old_requirements = """4. Use ONLY character names from the CHARACTER LIBRARY above
5. Reference character visual traits AND voice characteristics in scene descriptions
6. Follow the NARRATOR MODE rules strictly"""

new_requirements = """4. Use ONLY character names from the CHARACTER LIBRARY above
5. CHARACTER CONSISTENCY (CRITICAL):
   - If CHARACTER LIBRARY is provided: Use the EXACT visual traits from the library for ALL scenes
   - If NO character details provided: Generate detailed character descriptions in FIRST scene
   - For ALL subsequent scenes: Use the EXACT SAME character description from first scene
   - ONLY change: character's expression, movement, and action
   - NEVER change: physical appearance, clothing, colors, size, features
   - Example: If Ekabuddhi is "5cm emerald green frog" in Scene 1, must be EXACTLY same in Scene 2, 3, etc.
6. Reference character visual traits AND voice characteristics in scene descriptions
7. Follow the NARRATOR MODE rules strictly"""

content = content.replace(old_requirements, new_requirements)

# Update the numbering of subsequent requirements
content = content.replace(
    '7. For "narrator_with_visuals" mode: ALWAYS include BOTH narrator_text AND character dialogue',
    '8. For "narrator_with_visuals" mode: ALWAYS include BOTH narrator_text AND character dialogue'
)
content = content.replace(
    '8. Identify the LOCATION for each scene',
    '9. Identify the LOCATION for each scene'
)
content = content.replace(
    '9. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions',
    '10. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions'
)
content = content.replace(
    '10. Each scene description must be STANDALONE',
    '11. Each scene description must be STANDALONE'
)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added character consistency requirement to scene breaking")
print("📝 Characters will now maintain consistent appearance across all scenes")
print("🎨 Only expressions and movements will change, not physical features")
print("🔧 Server will auto-reload")
