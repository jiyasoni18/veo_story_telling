"""
Add character consistency enforcement to gemini.py
This will programmatically ensure characters look the same across all scenes
"""

import re

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the location after json.loads and add consistency enforcement
old_code = """                return json.loads(content.strip(), strict=False)
            except Exception as e:
                logging.error(f\"Failed to parse scene JSON: {e} | Text: {text_response}\")
                return None"""

new_code = """                scene_data = json.loads(content.strip(), strict=False)
                
                # ENFORCE CHARACTER CONSISTENCY across scenes
                if scene_data and 'scenes' in scene_data:
                    scenes = scene_data['scenes']
                    
                    # Extract character descriptions from first scene
                    character_base_descriptions = {}
                    
                    if len(scenes) > 0:
                        first_scene_desc = scenes[0].get('description', '')
                        
                        # For each character in the story, extract their base description from Scene 1
                        for scene in scenes:
                            for char_data in scene.get('characters', []):
                                char_name = char_data.get('name')
                                if char_name and char_name not in character_base_descriptions:
                                    # Try to extract character description from first scene
                                    # Look for pattern: "CharacterName is/are/was [description]"
                                    pattern = rf"{char_name}[^.]*?(?:is|are|was|were)\\s+([^.]+?)(?:\\.|,|\\s+(?:is|are|was|were|and|with|in|on|at|speaks|says|moves|swims|jumps|sits|stands|looks|appears))"
                                    match = re.search(pattern, first_scene_desc, re.IGNORECASE)
                                    if match:
                                        base_desc = match.group(1).strip()
                                        # Clean up the description - remove actions/expressions
                                        base_desc = re.sub(r'\\b(sitting|standing|swimming|jumping|looking|speaking|saying|moving|walking|running|calmly|quickly|slowly|worried|happy|sad|excited|scared)\\b', '', base_desc, flags=re.IGNORECASE)
                                        base_desc = ' '.join(base_desc.split())  # Clean whitespace
                                        character_base_descriptions[char_name] = base_desc
                        
                        # Now enforce consistency in all subsequent scenes
                        for i, scene in enumerate(scenes):
                            if i == 0:
                                continue  # Skip first scene
                            
                            scene_desc = scene.get('description', '')
                            
                            # For each character, replace their description with the base description
                            for char_name, base_desc in character_base_descriptions.items():
                                if char_name in scene_desc:
                                    # Find and replace the character description
                                    # Pattern: "CharacterName is/are/was [varying description]"
                                    pattern = rf"({char_name}[^.]*?(?:is|are|was|were))\\s+[^.]+?(?=\\.|,|\\s+(?:and|with|in|on|at|speaks|says|moves|swims|jumps|sits|stands|looks|appears))"
                                    
                                    def replace_desc(match):
                                        prefix = match.group(1)
                                        return f"{prefix} {base_desc}"
                                    
                                    scene_desc = re.sub(pattern, replace_desc, scene_desc, flags=re.IGNORECASE)
                                    scene['description'] = scene_desc
                
                return scene_data
            except Exception as e:
                logging.error(f\"Failed to parse scene JSON: {e} | Text: {text_response}\")
                return None"""

content = content.replace(old_code, new_code)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added character consistency enforcement to backend")
print("📝 Characters will now be programmatically enforced to be consistent")
print("🎨 Scene 1 character description will be reused in all scenes")
print("🔧 Server will auto-reload")
