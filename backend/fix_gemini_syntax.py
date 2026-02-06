"""
Fix syntax errors in gemini.py caused by incorrect string formatting
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken string literals by replacing the problematic section
# The issue is that \n was split across lines incorrectly

# Replace broken patterns
content = content.replace('": \r\n"', ':\\n"')
content = content.replace('": \n"', ':\\n"')
content = content.replace('":\r\n"', ':\\n"')
content = content.replace('":\n"', ':\\n"')

# Fix the specific broken lines
content = content.replace(
    'char_context = "CHARACTER LIBRARY (Use these exact names and voice characteristics):\r\n"',
    'char_context = "CHARACTER LIBRARY (Use these exact names and voice characteristics):\\n"'
)

content = content.replace(
    'char_context += f"\r\n{char_name}',
    'char_context += f"\\n{char_name}'
)

content = content.replace(
    'char_context += f"  - Visual Traits: {char_data.get(\'traits\', \'Not specified\')}\r\n"',
    'char_context += f"  - Visual Traits: {char_data.get(\'traits\', \'Not specified\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Voice ID: {char_data.get(\'voice_id\', \'V1_Standard\')}\r\n"',
    'char_context += f"  - Voice ID: {char_data.get(\'voice_id\', \'V1_Standard\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Voice Tone: {char_data.get(\'voice_tone\', \'Professional\')}\r\n"',
    'char_context += f"  - Voice Tone: {char_data.get(\'voice_tone\', \'Professional\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Is Narrator: {\'Yes\' if is_narrator else \'No\'}\r\n"',
    'char_context += f"  - Is Narrator: {\'Yes\' if is_narrator else \'No\'}\\n"'
)

content = content.replace(
    'char_context += f"  - Age Range: {char_data.get(\'age_range\')}\r\n"',
    'char_context += f"  - Age Range: {char_data.get(\'age_range\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Vocal Quality: {char_data.get(\'vocal_quality\')}\r\n"',
    'char_context += f"  - Vocal Quality: {char_data.get(\'vocal_quality\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Speaking Style: {char_data.get(\'speaking_style\')}\r\n"',
    'char_context += f"  - Speaking Style: {char_data.get(\'speaking_style\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Accent: {char_data.get(\'accent\')}\r\n"',
    'char_context += f"  - Accent: {char_data.get(\'accent\')}\\n"'
)

content = content.replace(
    'char_context += f"  - Emotional Baseline: {char_data.get(\'emotional_baseline\')}\r\n"',
    'char_content += f"  - Emotional Baseline: {char_data.get(\'emotional_baseline\')}\\n"'
)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed syntax errors in gemini.py")
print("🔧 Corrected string literal formatting")
