"""
Add narrator voiceover support to prompt_builder.py
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\prompt_builder.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location to insert narrator code (after char_block = "\n\n".join(char_prompts))
old_code = """        char_block = "\\n\\n".join(char_prompts)
        scene_dialogue = scene.get('dialogue')
        
        # Get background visual style from project settings
        background_visual_style = project.get("settings", {}).get("background_visual_style", visual_style)"""

new_code = """        char_block = "\\n\\n".join(char_prompts)
        scene_dialogue = scene.get('dialogue')
        
        # Get narrator text from scene
        narrator_text = scene.get('narrator_text', '')
        
        # Build narrator block if narrator text exists
        narrator_block = ""
        if narrator_text:
            # Find narrator character from project characters
            narrator_char = None
            for char_name, char_info in project_chars.items():
                if char_info.get('is_narrator', False):
                    narrator_char = char_name
                    narrator_info = char_info
                    break
            
            if narrator_char:
                # Build narrator voice anchor
                age_range = narrator_info.get("age_range", "")
                vocal_quality = narrator_info.get("vocal_quality", "")
                speaking_style = narrator_info.get("speaking_style", "")
                accent = narrator_info.get("accent", "")
                emotional_baseline = narrator_info.get("emotional_baseline", "")
                
                voice_anchor = ""
                if age_range or vocal_quality or speaking_style or accent or emotional_baseline:
                    voice_parts = [f"{narrator_char}, a storyteller"]
                    if age_range:
                        voice_parts.append(f"in their {age_range}")
                    if vocal_quality:
                        voice_parts.append(f"with a {vocal_quality}")
                    if speaking_style:
                        voice_parts.append(speaking_style)
                    if accent:
                        voice_parts.append(accent)
                    if emotional_baseline:
                        voice_parts.append(f"speaks with {emotional_baseline}")
                    
                    voice_anchor = ", ".join(voice_parts) + "."
                
                narrator_block = f\"\"\"NARRATOR (VOICEOVER):
- Narrator Name: {narrator_char}
- Voice Anchor (MUST REMAIN IDENTICAL IN ALL SCENES): {voice_anchor if voice_anchor else 'Warm, engaging storytelling voice'}
- Narration Text: "{narrator_text}"
- [TECHNICAL: Narrator speaks as background voiceover, not visible on screen]

\"\"\"
            else:
                # No narrator character found, but we have narrator text
                narrator_block = f\"\"\"NARRATOR (VOICEOVER):
- Narration Text: "{narrator_text}"
- [TECHNICAL: Narrator speaks as background voiceover]

\"\"\"
        
        # Get background visual style from project settings
        background_visual_style = project.get("settings", {}).get("background_visual_style", visual_style)"""

content = content.replace(old_code, new_code)

# Now update the system_prompt to include narrator_block
old_prompt_start = """CAMERA & CINEMATOGRAPHY:
- Camera Angle: {scene.get('camera_angle', 'Eye level')}
- Transition Style: {scene.get('transition_type', 'Cut')}
- Lighting: Dramatic cinematic lighting with natural shadows
- Time of Day: {scene.get('time_of_day', 'Day')}
- Camera Movement: Smooth, professional (no shaky cam)

CHARACTERS IN THIS SCENE (COMPLETE DESCRIPTIONS - MUST BE IDENTICAL EVERY TIME):
{char_block}"""

new_prompt_start = """CAMERA & CINEMATOGRAPHY:
- Camera Angle: {scene.get('camera_angle', 'Eye level')}
- Transition Style: {scene.get('transition_type', 'Cut')}
- Lighting: Dramatic cinematic lighting with natural shadows
- Time of Day: {scene.get('time_of_day', 'Day')}
- Camera Movement: Smooth, professional (no shaky cam)

{narrator_block}CHARACTERS IN THIS SCENE (COMPLETE DESCRIPTIONS - MUST BE IDENTICAL EVERY TIME):
{char_block}"""

content = content.replace(old_prompt_start, new_prompt_start)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\prompt_builder.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added narrator voiceover support to prompt_builder.py")
print("📝 Narrator text will now be included in final prompts")
print("🎙️ Narrator voice anchor added for consistency")
print("🔧 Server will auto-reload")
