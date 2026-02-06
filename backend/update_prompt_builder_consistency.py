"""
Update prompt_builder.py to use character base descriptions for consistency
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\prompt_builder.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where we build character traits and update to use base descriptions
old_char_building = """        for char_name, scene_data in scene.get(\"characters_in_scene\", {}).items():
            char_info = project_chars.get(char_name, {})
            base_traits = char_info.get(\"traits\", \"\")"""

new_char_building = """        # Get character base descriptions from scene (for consistency)
        character_base_descriptions = scene.get('character_base_descriptions', {})
        
        for char_name, scene_data in scene.get(\"characters_in_scene\", {}).items():
            char_info = project_chars.get(char_name, {})
            
            # Use base description from scene if available (for consistency across scenes)
            # Otherwise use traits from character library
            if char_name in character_base_descriptions:
                base_traits = character_base_descriptions[char_name]
            else:
                base_traits = char_info.get(\"traits\", \"\")"""

content = content.replace(old_char_building, new_char_building)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\prompt_builder.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated prompt_builder.py to use character base descriptions")
print("📝 Characters will now use consistent descriptions from Scene 1")
print("🎨 No more 'golden fish' in Scene 1 and 'blue fish' in Scene 3!")
print("🔧 Server will auto-reload")
