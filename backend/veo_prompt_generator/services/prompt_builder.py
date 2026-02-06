from veo_prompt_generator.services.gemini import gemini_service
import logging
import httpx

class PromptBuilderService:
    @staticmethod
    async def generate_final_prompt(project: dict, scene: dict):
        visual_style = project.get("settings", {}).get("visual_style", "Cinematic Photorealism")
        
        # Build character trait block
        char_prompts = []
        project_chars = project.get("characters", {})
        
        # Get character base descriptions from scene (for consistency)
        character_base_descriptions = scene.get('character_base_descriptions', {})
        
        for char_name, scene_data in scene.get("characters_in_scene", {}).items():
            char_info = project_chars.get(char_name, {})
            
            # Use base description from scene if available (for consistency across scenes)
            # Otherwise use traits from character library
            if char_name in character_base_descriptions:
                base_traits = character_base_descriptions[char_name]
            else:
                base_traits = char_info.get("traits", "")
            consistency_rules = char_info.get("consistency_rules", "")
            voice_id = char_info.get("voice_id", "V1_Standard") 
            voice_tone = char_info.get("voice_tone", "Calm and professional")
            
            # Voice Lock Characteristics
            age_range = char_info.get("age_range", "")
            vocal_quality = char_info.get("vocal_quality", "")
            speaking_style = char_info.get("speaking_style", "")
            accent = char_info.get("accent", "")
            emotional_baseline = char_info.get("emotional_baseline", "")
            
            # Build Voice Anchor Block if voice characteristics are present
            voice_anchor = ""
            if age_range or vocal_quality or speaking_style or accent or emotional_baseline:
                voice_parts = [f"{char_name}, a person"]
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
            
            # ONLY use character-specific dialogue for that specific character
            char_dialogue = scene_data.get('dialogue', "")
            
            # Get character visual style
            char_visual_style = char_info.get("visual_style", visual_style)
            
            p = f"CHARACTER: {char_name}\n"
            p += f"- Visual Style: {char_visual_style} (MUST BE CONSISTENT IN ALL SCENES)\n"
            p += f"- Visual Traits: {base_traits}\n"
            
            # Add Voice Anchor Block if present (CRITICAL FOR CONSISTENCY)
            if voice_anchor:
                p += f"- Voice Anchor (MUST REMAIN IDENTICAL IN ALL SCENES): {voice_anchor}\n"
            
            p += f"- Voice ID: {voice_id} ({voice_tone})\n"
            if char_dialogue:
                p += f"- Dialogue to SPEAK: \"{char_dialogue}\" (Spoken ONLY by {char_name})\n"
            else:
                p += f"- Action: {char_name} is silent but present.\n"
            if consistency_rules:
                p += f"- Consistency Rules: {consistency_rules}\n"
            p += f"- Scene Action: {scene_data.get('action', scene.get('description'))}\n"
            p += f"- Emotion: {scene_data.get('emotion', scene.get('emotion', 'neutral'))}\n"
            char_prompts.append(p)

        char_block = "\n\n".join(char_prompts)
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
                
                narrator_block = f"""NARRATOR (VOICEOVER):
- Narrator Name: {narrator_char}
- Voice Anchor (MUST REMAIN IDENTICAL IN ALL SCENES): {voice_anchor if voice_anchor else 'Warm, engaging storytelling voice'}
- Narration Text: "{narrator_text}"
- [TECHNICAL: Narrator speaks as background voiceover, not visible on screen]

"""
            else:
                # No narrator character found, but we have narrator text
                narrator_block = f"""NARRATOR (VOICEOVER):
- Narration Text: "{narrator_text}"
- [TECHNICAL: Narrator speaks as background voiceover]

"""
        
        # Get background visual style from project settings
        background_visual_style = project.get("settings", {}).get("background_visual_style", visual_style)
        
        # Determine if this is the first scene
        scene_number = scene.get('scene_number', 1)
        is_first_scene = scene_number == 1
        
        system_prompt = f"""Generate a technical prompt optimized for GOOGLE VEO 3.1 with ABSOLUTE CHARACTER CONSISTENCY.

TARGET: Google Veo 3.1 Video Generation (Standalone Prompt - No Scene References)
CHARACTER VISUAL STYLE: Defined per character (see character blocks below)
BACKGROUND/ENVIRONMENT VISUAL STYLE: {background_visual_style} (MUST BE CONSISTENT IN ALL SCENES)
DURATION: {scene.get('duration', 8)} seconds

CURRENT SCENE DESCRIPTION:
{scene.get('description')}

CAMERA & CINEMATOGRAPHY:
- Camera Angle: {scene.get('camera_angle', 'Eye level')}
- Transition Style: {scene.get('transition_type', 'Cut')}
- Lighting: Dramatic cinematic lighting with natural shadows
- Time of Day: {scene.get('time_of_day', 'Day')}
- Camera Movement: Smooth, professional (no shaky cam)

{narrator_block}CHARACTERS IN THIS SCENE (COMPLETE DESCRIPTIONS - MUST BE IDENTICAL EVERY TIME):
{char_block}

GOOGLE VEO 3.1 ABSOLUTE CONSISTENCY RULES:

CRITICAL: Veo processes each prompt independently. DO NOT reference "Scene 1", "previous scene", or "continuing from". Instead, provide COMPLETE, ULTRA-SPECIFIC character descriptions that will naturally result in identical appearance across all prompts.

1. CHARACTER DESCRIPTION STRATEGY (HIGHEST PRIORITY):
   - Provide COMPLETE visual description for EVERY character in EVERY prompt
   - Use EXTREMELY SPECIFIC details: exact color names, precise measurements, unique identifiers
   - Include ALL 12 parameters: skin tone, eyes, eyebrows, nose, mouth, facial hair, face shape, hair/headwear, clothing, jewelry, marks, build
   - Use unique descriptors that are hard to vary: "ornate turban with golden peacock ornament", "rich maroon garment with intricate gold lotus embroidery"
   - The more specific the description, the more consistent Veo's output

2. SPECIFICITY EXAMPLES:
   ❌ Generic: "man in turban"
   ✅ Specific: "man wearing ornate turban with golden peacock ornament and emerald green feather accent"
   
   ❌ Generic: "traditional clothing"
   ✅ Specific: "rich maroon traditional garment with intricate gold lotus embroidery on collar and sleeves"
   
   ❌ Generic: "jewelry"
   ✅ Specific: "three strands of white pearl necklaces with gold clasp"

3. BACKGROUND & SETTING INTEGRATION:
   - Provide COMPLETE setting description in EVERY prompt
   - Use specific architectural or natural details
   - Examples: "grand palace entrance with white marble pillars featuring gold-trimmed Mughal arches"
   - Include environmental elements: "polished marble floor with geometric inlay patterns"
   - The same location should have the EXACT same description every time

4. COLOR PRECISION:
   - Never use generic colors: "dark", "light", "bright"
   - Always use specific color names: "maroon", "golden", "emerald green", "warm olive", "deep brown"
   - Include color modifiers: "rich maroon", "bright golden", "deep emerald green"
   - Specify textures: "smooth olive skin", "polished gold ornament", "soft pearl luster"

5. UNIQUE IDENTIFIERS:
   - Include distinctive features that make the character unmistakable
   - Examples: "small red tilak mark on forehead", "golden peacock ornament on turban", "three pearl necklaces"
   - These unique details help Veo maintain consistency

6. CAMERA ANGLE IMPLEMENTATION:
   - Use the specified camera angle: {scene.get('camera_angle', 'Eye level')}
   - Frame characters to show identifying features
   - For close-ups: emphasize facial features and headwear
   - For wide shots: include full outfit and posture

7. TRANSITION STYLE (NOT SCENE REFERENCE):
   - Implement: {scene.get('transition_type', 'Cut')}
   - Describe the transition effect itself, not what it transitions from
   - For "Fade": "The scene fades in smoothly..."
   - For "Cut": "The scene opens with..."
   - For "Dissolve": "The scene dissolves into view..."

8. LIP-SYNC & DIALOGUE:
   - Synchronize mouth movements PRECISELY with dialogue
   - Include technical marker: [TECHNICAL: Lip-sync active for {', '.join(scene.get('characters_in_scene', {}).keys())}]
   - Show clear mouth articulation for each word
   - Non-speaking characters: closed mouths, reactive expressions

9. VEO 3.1 BEST PRACTICES:
   - Each prompt must be COMPLETELY STANDALONE
   - Describe everything as if Veo has never seen this character before
   - Use consistent, specific language across all prompts
   - Include lighting, positioning, and spatial relationships
   - Describe background elements in detail

10. CONSISTENCY THROUGH REPETITION:
   - Use the EXACT SAME descriptive phrases for the same elements
   - If Scene 1 says "ornate turban with golden peacock ornament", Scene 2 must say "ornate turban with golden peacock ornament"
   - If Scene 1 says "rich maroon traditional garment", Scene 2 must say "rich maroon traditional garment"
   - Copy-paste the exact character description across all scenes

OUTPUT FORMAT:
Write a single, cohesive technical prompt (300-400 words) that Veo 3.1 can understand as a STANDALONE prompt.

MANDATORY STRUCTURE:
1. Opening with Transition: "[Transition effect] reveals [setting]..." (30-40 words)
2. Complete Character Description: Full visual description with ALL 12 parameters, ultra-specific details (150-200 words)
3. Action & Dialogue: What happens, what's said with lip-sync markers (50-70 words)
4. Complete Background Details: Full setting description with specific architectural/natural elements (50-70 words)
5. Technical: Lighting, camera movement, atmosphere (20-30 words)

CRITICAL INSTRUCTIONS:
- NO references to "Scene 1", "Scene 2", "previous scene", "continuing from"
- EVERY prompt must be 100% standalone
- Provide COMPLETE character description EVERY time
- Use ULTRA-SPECIFIC details (exact colors, unique ornaments, precise counts)
- Use the EXACT SAME descriptive phrases for the same character across all prompts
- More specificity = better consistency

EXAMPLE CHARACTER DESCRIPTION (Use this level of detail):
"A man with warm olive skin and smooth texture, deep brown almond-shaped eyes conveying confidence, thick arched eyebrows, straight nose with defined bridge, full lips in neutral expression, well-groomed short beard. His face is oval-shaped with strong jawline. He wears an ornate turban with golden peacock ornament and emerald green feather accent positioned on the right side. His clothing consists of a rich maroon traditional garment with intricate gold lotus embroidery on the collar and three gold buttons on the sleeves. Three strands of white pearl necklaces with gold clasp adorn his neck. A small red tilak mark is visible centered on his forehead. He has an athletic build with broad shoulders and upright, confident posture."

Make it vivid, specific, and cinematically precise. PRIORITIZE ULTRA-SPECIFIC DESCRIPTIONS FOR CONSISTENCY.

Return ONLY the final technical prompt text."""

        # Use Gemini to refine the technical prompt
        url = f"{gemini_service.base_url}/{gemini_service.model}:generateContent?key={gemini_service.api_key}"
        payload = {
            "contents": [{"parts": [{"text": system_prompt}]}],
            "generationConfig": {"temperature": 0.5}
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=120.0)
            if response.status_code == 200:
                result = response.json()
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                logging.error(f"Failed to generate refined prompt: {response.text}")
                return f"{visual_style} video: {scene.get('description')}. Characters: {char_block}"

prompt_builder = PromptBuilderService()
