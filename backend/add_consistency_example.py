"""
Add character consistency example to gemini.py
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the MULTIPLE CHARACTERS EXAMPLE and add character consistency example after it
old_example = """MULTIPLE CHARACTERS EXAMPLE:
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

new_example = """MULTIPLE CHARACTERS EXAMPLE:
{{
  "scene_number": 2,
  "narrator_text": "दोनों मछलियां आपस में बात कर रही थी",
  "characters": [
    {{ "name": "Shatbuddhi", "dialogue": "हमें यहां से भागना चाहिए" }},
    {{ "name": "Sahastrabuddhi", "dialogue": "नहीं हम यहीं रहेंगे" }}
  ]
}}
NOTE: Each character gets their OWN dialogue, not both dialogues to one character!

CHARACTER CONSISTENCY EXAMPLE:
Scene 1: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes"
Scene 2: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes" (SAME!)
Scene 3: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes" (SAME!)
✅ Physical description IDENTICAL across all scenes
✅ Only expression/movement changes: "looking worried", "swimming quickly", "sitting calmly"
❌ NEVER change: size, color, features, clothing

IMPORTANT NARRATOR MODE RULES:"""

content = content.replace(old_example, new_example)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added character consistency example")
print("📝 LLM will now see clear example of maintaining character appearance")
print("🎨 Physical traits stay same, only expressions/movements change")
print("🔧 Server will auto-reload")
