"""
Better character consistency enforcement - store and reuse descriptions
"""

# Read the file
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the complex regex approach with a simpler, more robust one
old_enforcement = """                scene_data = json.loads(content.strip(), strict=False)
                
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
                
                return scene_data"""

new_enforcement = """                scene_data = json.loads(content.strip(), strict=False)
                
                # ENFORCE CHARACTER CONSISTENCY across scenes
                if scene_data and 'scenes' in scene_data:
                    scenes = scene_data['scenes']
                    
                    # Step 1: Build character base descriptions from Scene 1 or character library
                    character_base_descriptions = {}
                    
                    # If user provided character details, use those
                    if characters:
                        for char_name, char_info in characters.items():
                            traits = char_info.get('traits', '')
                            if traits:
                                character_base_descriptions[char_name] = traits
                    
                    # Step 2: For characters without library details, extract from Scene 1
                    if len(scenes) > 0:
                        first_scene = scenes[0]
                        
                        # Get all character names that appear in the story
                        all_char_names = set()
                        for scene in scenes:
                            for char_data in scene.get('characters', []):
                                char_name = char_data.get('name')
                                if char_name:
                                    all_char_names.add(char_name)
                        
                        # For each character, if we don't have their description, extract from Scene 1
                        first_scene_desc = first_scene.get('description', '')
                        for char_name in all_char_names:
                            if char_name not in character_base_descriptions and char_name in first_scene_desc:
                                # Store the entire first scene description as the base
                                # We'll use this to maintain consistency
                                character_base_descriptions[char_name] = first_scene_desc
                    
                    # Step 3: Add character_base_description field to each scene
                    # This will be used by prompt_builder to ensure consistency
                    for scene in scenes:
                        scene['character_base_descriptions'] = character_base_descriptions.copy()
                
                return scene_data"""

content = content.replace(old_enforcement, new_enforcement)

# Write back
with open(r'c:\Users\JIYA SONI\Desktop\Video generation\veo-prompt-generator\backend\veo_prompt_generator\services\gemini.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated character consistency enforcement")
print("📝 Now stores character base descriptions from Scene 1")
print("🎨 Prompt builder will use these for consistency")
print("🔧 Server will auto-reload")
