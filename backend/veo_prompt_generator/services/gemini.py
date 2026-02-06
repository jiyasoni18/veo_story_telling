import httpx
import json
from veo_prompt_generator.core.config import settings
import logging

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1/models"
        self.model = "gemini-2.5-flash"

    async def analyze_character_image(self, image_base64: str, mime_type: str = "image/jpeg"):
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        prompt = """PART 1: VISUAL STYLE DETECTION
First, identify the visual style of this image (e.g., Cinematic Photorealism, 3D Animation, 2D Anime, Cartoon, Oil Painting, etc.).

PART 2: CHARACTER DESCRIPTION
Then, analyze the character and create a CONCISE SUMMARY covering these 12 parameters:
1. Skin tone and texture
2. Eye color, shape, and expression
3. Eyebrow characteristics
4. Nose/beak features
5. Mouth/lip appearance and expression
6. Facial hair (or lack thereof)
7. Face shape and structure
8. Hair/headwear details
9. Clothing colors and style
10. Jewelry and ornaments
11. Distinctive marks (tilak, bindi, scars, tattoos)
12. Body build and posture

REQUIREMENTS:
- First line MUST be: "VISUAL STYLE: [detected style]"
- Then write character description as a single flowing paragraph
- Mention ALL 12 parameters briefly
- Use specific color names (not generic terms like "dark" or "light")
- Keep character description 150-200 words
- No bullet points in the description
- No preamble or introduction

EXAMPLE OUTPUT FORMAT:
VISUAL STYLE: Cinematic Photorealism

The character has warm olive skin with smooth texture, deep brown almond-shaped eyes conveying confidence, thick arched eyebrows, a straight nose with defined bridge, full lips in a neutral expression, and a well-groomed short beard. The face is oval-shaped with strong jawline. He wears an ornate turban with golden ornament and green feather accent. His clothing consists of a rich maroon traditional garment with intricate gold embroidery on the collar and sleeves. Multiple strands of pearl necklaces adorn his neck. A small red tilak mark is visible on his forehead. He has an athletic build with upright, confident posture.

Return ONLY a JSON object with keys: "traits" (the description following the format above) and "visual_style" (the detected style)."""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_base64.split(",")[-1] if "," in image_base64 else image_base64
                            }
                        }
                    ]
                }
            ]
            # Removed generationConfig entirely to avoid schema mismatch errors
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=60.0)
            if response.status_code != 200:
                logging.error(f"Gemini API Error: {response.text}")
                return None
            
            result = response.json()
            if 'candidates' not in result or not result['candidates']:
                logging.error(f"No candidates in Gemini response: {result}")
                return None
            
            first_candidate = result['candidates'][0]
            if 'content' not in first_candidate:
                logging.error(f"Gemini blocked response (likely safety): {first_candidate}")
                return None
                
            text_response = first_candidate['content']['parts'][0]['text']
            
            # Manually extract JSON from text in case it's wrapped in markdown
            try:
                if "```" in text_response:
                    text_response = text_response.split("```")[1]
                    if text_response.startswith("json"):
                        text_response = text_response[4:]
                return json.loads(text_response.strip(), strict=False)
            except Exception as e:
                logging.error(f"Failed to parse JSON: {e} | Text: {text_response}")
                return None

    async def break_story_into_scenes(
        self, 
        story_text: str, 
        characters: dict = None,
        narrator_mode: str = "narrator_with_visuals",
        background_visual_style: str = "Cinematic Photorealism"
    ):
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        # Find narrator character
        narrator_name = None
        if characters:
            for char_name, char_data in characters.items():
                if char_data.get('is_narrator', False):
                    narrator_name = char_name
                    break
        
        char_context = ""
        if characters:
            char_context = "CHARACTER LIBRARY (Use these exact names and voice characteristics):\n"
            for char_name, char_data in characters.items():
                is_narrator = char_data.get('is_narrator', False)
                char_context += f"\n{char_name}{' (NARRATOR)' if is_narrator else ''}:\n"
                char_context += f"  - Visual Traits: {char_data.get('traits', 'Not specified')}\n"
                char_context += f"  - Voice ID: {char_data.get('voice_id', 'V1_Standard')}\n"
                char_context += f"  - Voice Tone: {char_data.get('voice_tone', 'Professional')}\n"
                char_context += f"  - Is Narrator: {'Yes' if is_narrator else 'No'}\n"
                
                # Add voice characteristics if available
                if char_data.get('age_range'):
                    char_context += f"  - Age Range: {char_data.get('age_range')}\n"
                if char_data.get('vocal_quality'):
                    char_context += f"  - Vocal Quality: {char_data.get('vocal_quality')}\n"
                if char_data.get('speaking_style'):
                    char_context += f"  - Speaking Style: {char_data.get('speaking_style')}\n"
                if char_data.get('accent'):
                    char_context += f"  - Accent: {char_data.get('accent')}\n"
                if char_data.get('emotional_baseline'):
                    char_context += f"  - Emotional Baseline: {char_data.get('emotional_baseline')}\n"

        # Build mode-specific instructions
        mode_instructions = ""
        if narrator_mode == "narrator_with_visuals":
            mode_instructions = """
NARRATOR MODE: Narrator + Visual Scenes

RULES:
- Narrator character MUST provide voiceover narration in narrator_text field (ALWAYS include narrator_text)
- Narrator describes the scene/action in background
- Characters shown visually AND can also speak SHORT dialogue (dialogue field)
- BOTH narrator_text AND character dialogue must be present in EVERY scene
- Narrator speaks as background voiceover while characters speak their lines
- Characters have lip-sync when they speak
- Keep character dialogue SHORT (max 10-15 words per character to fit in 8 seconds)

EXAMPLE:
narrator_text: "प्राचीन समय में एक तालाब में दो मछलियां रहती थी"
characters: [{"name": "Shatbuddhi", "dialogue": "हम यहां सुरक्षित हैं"}]
"""
        elif narrator_mode == "narrator_only":
            mode_instructions = """
NARRATOR MODE: Narrator Only (Characters Silent)

RULES:
- ONLY narrator speaks (provides ALL dialogue and narration in narrator_text)
- Characters shown visually but COMPLETELY SILENT
- Character dialogue field MUST be empty string ""
- NO lip-sync for characters (mouths closed)
- Narrator describes everything including what characters would say
- Narrator text should fit in 8 seconds (max 40-50 words)
"""
        else:  # mode == "none"
            mode_instructions = """
NARRATOR MODE: None (Characters Speak Only)

RULES:
- NO narrator at all
- narrator_text field MUST be empty string ""
- ONLY characters speak with lip-sync (dialogue field)
- Pure character dialogue driven
- Keep dialogue SHORT (max 10-15 words per character to fit in 8 seconds)
"""

        prompt = f"""Break this STORY into a sequence of precisely 8-second video scenes.
Return the output as a RAW JSON OBJECT.

NARRATOR MODE: {narrator_mode}
BACKGROUND VISUAL STYLE: {background_visual_style}
{mode_instructions}

{char_context}

STORY:
{story_text}

CRITICAL REQUIREMENTS:
1. Each scene MUST be exactly 8 seconds
2. DIALOGUE LENGTH: Keep ALL dialogue SHORT to fit in 8 seconds:
   - Character dialogue: Maximum 10-15 words per character
   - Narrator text: Maximum 40-50 words
   - If original dialogue is too long, SPLIT into multiple scenes
3. MULTIPLE CHARACTERS IN SCENE:
   - If 2+ characters are in a scene, assign dialogue to the CORRECT character
   - Each character should have their OWN dialogue (don't give all dialogue to one character)
   - Clearly identify WHO is speaking WHAT
   - Example: If Shatbuddhi and Sahastrabuddhi are both present:
     * Shatbuddhi gets Shatbuddhi's dialogue
     * Sahastrabuddhi gets Sahastrabuddhi's dialogue
     * Don't give both dialogues to just one fish!
4. Use ONLY character names from the CHARACTER LIBRARY above
5. CHARACTER CONSISTENCY (CRITICAL):
   - If CHARACTER LIBRARY is provided: Use the EXACT visual traits from the library for ALL scenes
   - If NO character details provided: Generate detailed character descriptions in FIRST scene
   - For ALL subsequent scenes: Use the EXACT SAME character description from first scene
   - ONLY change: character's expression, movement, and action
   - NEVER change: physical appearance, clothing, colors, size, features
   - Example: If Ekabuddhi is "5cm emerald green frog" in Scene 1, must be EXACTLY same in Scene 2, 3, etc.
6. Reference character visual traits AND voice characteristics in scene descriptions
7. Follow the NARRATOR MODE rules strictly
8. For "narrator_with_visuals" mode: ALWAYS include BOTH narrator_text AND character dialogue
9. Identify the LOCATION for each scene (e.g., forest, temple, city, cave, mountain, etc.)
10. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions
11. Each scene description must be STANDALONE (understandable without other scenes)

JSON STRUCTURE:
{{
  "scenes": [
    {{
      "scene_number": 1,
      "description": "Visual description (standalone, no scene references)...",
      "location": "forest",
      "narrator_text": "What narrator says (empty if mode is 'none')",
      "characters": [
        {{ "name": "CharacterName", "dialogue": "Their specific line (empty if mode is 'narrator_only')" }}
      ],
      "emotion": "Heroic",
      "scene_type": "action/dialogue",
      "camera_angle": "Close-up",
      "transition_type": "Cut"
    }}
  ]
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

CHARACTER CONSISTENCY EXAMPLE:
Scene 1: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes"
Scene 2: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes" (SAME!)
Scene 3: "Ekabuddhi is a small, compact frog, 5cm in length, emerald green skin, golden-amber eyes" (SAME!)
✅ Physical description IDENTICAL across all scenes
✅ Only expression/movement changes: "looking worried", "swimming quickly", "sitting calmly"
❌ NEVER change: size, color, features, clothing

IMPORTANT NARRATOR MODE RULES:
- If mode is "narrator_with_visuals": Include narrator_text AND character dialogue
- If mode is "narrator_only": Include narrator_text, character dialogue MUST be empty ""
- If mode is "none": narrator_text MUST be empty "", include character dialogue

Return ONLY the JSON object, no markdown formatting."""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=60.0)
            if response.status_code != 200:
                logging.error(f"Gemini API Error: {response.text}")
                return None
            
            result = response.json()
            if 'candidates' not in result or not result['candidates']:
                return None
                
            first_candidate = result['candidates'][0]
            if 'content' not in first_candidate:
                logging.error(f"Gemini blocked response (likely safety) in break_story: {first_candidate}")
                return None

            text_response = first_candidate['content']['parts'][0]['text']
            
            try:
                # Clean markdown if present
                content = text_response.strip()
                if content.startswith("```"):
                    lines_text = content.split("\n")
                    content = "\n".join(lines_text[1:-1])
                    if content.startswith("json"):
                        content = content[4:]
                
                scene_data = json.loads(content.strip(), strict=False)
                
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
                
                return scene_data
            except Exception as e:
                logging.error(f"Failed to parse scene JSON: {e} | Text: {text_response}")
                return None



    async def generate_talking_character_prompt(self, character_type: str, topic: str, language: str, personality: str):
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        
        prompt = f"""Generate a technical Google Veo prompt:
CHARACTER: {character_type}
TOPIC: {topic}
PERSONALITY: {personality}
LANGUAGE: {language}

Cues: 3D Animation, lip-sync, expressive mouth."""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    candidate = result['candidates'][0]
                    if 'content' in candidate:
                        return candidate['content']['parts'][0]['text']
                logging.error(f"Gemini blocked response in character prompt: {result}")
                return None
            return None

    async def generate_educational_prompt(self, character_name: str, voice_tone: str, topic_type: str, language: str, duration: int):
        """Generate complete educational health content prompt(s) - supports multi-scene"""
        
        # Calculate number of scenes (each scene is 8 seconds)
        num_scenes = duration // 8
        
        # Voice mapping
        voice_mapping = {
            "angry": {"type": "male_deep", "description": "Deep, resonant, strong MALE voice", "emotion": "angry"},
            "friendly": {"type": "female_bright", "description": "Warm, friendly, upbeat FEMALE voice", "emotion": "cheerful"},
            "educational": {"type": "male_medium", "description": "Strong, clear, authoritative MALE voice", "emotion": "educational"},
            "serious": {"type": "male_deep", "description": "Deep, serious, professional MALE voice", "emotion": "serious"}
        }
        
        voice_info = voice_mapping.get(voice_tone, voice_mapping["educational"])
        
        # Use stable model (gemini-1.5-flash) to avoid 429 Resource Exhausted errors
        url = f"{self.base_url}/gemini-2.5-flash:generateContent?key={self.api_key}"
        
        scenes = []
        
        import asyncio
        for scene_num in range(1, num_scenes + 1):
             # Build scene-specific prompt
            scene_context = ""
            if scene_num == 1:
                scene_context = "This is the FIRST scene - introduce the character and topic."
            elif scene_num == num_scenes:
                scene_context = f"This is the FINAL scene (Scene {scene_num}) - conclude the message with impact."
            else:
                scene_context = f"This is Scene {scene_num} - continue developing the message. Ensure a smooth visual transition from the previous scene."
            
            # Add small delay to avoid rate limits
            if scene_num > 1:
                await asyncio.sleep(1)

            print(f"Generating Scene {scene_num}/{num_scenes} for {character_name} ({duration}s total)...")

            prompt = f"""Generate a complete educational health video prompt for Google Veo.

CHARACTER: {character_name}
TOPIC TYPE: {topic_type.replace('_', ' ').title()}
VOICE TONE: {voice_tone.title()}
LANGUAGE: {language}
SCENE: {scene_num} of {num_scenes}
DURATION: 8 seconds (this scene only)
TARGET WORD COUNT: 30-40 words

{scene_context}

GENERATE THE FOLLOWING SECTIONS:

GENERATE THE FOLLOWING SECTIONS:

1. VISUAL PROMPT (200-300 words):
   - CREATE A BACKGROUND AND SETTING SPECIFICALLY FOR: "{character_name}"
   - The environment should be conceptually related to {character_name} (e.g., if Sugar, maybe a crystalline world; if Vegetable, maybe a garden or nature; if Pill, maybe abstract medical). YOU DECIDE the best setting.
   - ATMOSPHERE & AMBIENCE: Matches {topic_type.replace('_', ' ')} (e.g., {"Chaotic, dark, distorted, warning atmosphere" if topic_type == "side_effect" else "Clean, bright, vibrant, flourishing atmosphere"})
   - FOCUS ON BACKGROUND and ENVIRONMENT DETAILS (Do NOT describe character appearance, user provides image)
   - dynamic lighting matching the mood ({voice_tone})
   - Visual metaphors for {"negative impact" if topic_type == "side_effect" else "positive growth/health"} integrated into the background
   - {"Show environment deteriorating/darkening" if scene_num > 1 and topic_type == "side_effect" else ("Show environment blooming/brightening" if scene_num > 1 else "Establish the world")}
   - CAMERA: Steady, cinematic camera movement. NO shaky cam.
   - TRANSITION: {"Seamless, flowing transition from previous state" if scene_num > 1 else "Fade in from black"}

2. DIALOGUE ({language.upper()}):
   - 30-40 words in {language}
   - {"Warning, cautionary, serious tone about health risks" if topic_type == "side_effect" else "Positive, encouraging, informative tone about health benefits"}
   - First-person perspective (character speaking)
   - {"Explain the negative effects on the body" if topic_type == "side_effect" else "Explain the positive benefits for health"}
   - Natural, conversational language
   - {"Build on previous scene's message" if scene_num > 1 else "Introduce the topic"}

3. AUDIO STYLE:
   - Voice description: {voice_info['description']}
   - Pitch/Timbre: {voice_info['type']}
   - Emotion: {voice_info['emotion']}
   - Background music: {"Ominous, warning tones with low hum" if topic_type == "side_effect" else "Uplifting, positive tones with gentle melody"}

OUTPUT FORMAT (EXACT):

Visual Prompt:
[Your detailed visual description here. Include constraint: "NO text overlays, NO subtitles, NO watermarks, NO jump cuts, NO fast cuts, NO neon colors, NO cluttered backgrounds, NO man-made logos".]

Dialogue ({language.upper()}):
[Your dialogue text in {language} here]

[SCENE METADATA]
Duration: 8 seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: {voice_info['description']}. Pitch/Timbre: {voice_info['type']}. Emotion: {voice_info['emotion']}.
Background: [Your background music description]

[LIP SYNC DATA]
0.0s-8.0s
Speaker: {character_name.lower().replace(' ', '_')}
Voice ID: {character_name.lower().replace(' ', '_')}_{voice_info['type']}
Lip Sync Target: {character_name.lower().replace(' ', '_')}_face_mesh
Text: "[Exact dialogue text repeated here]"

CRITICAL REQUIREMENTS:
- Visual prompt must be vivid and specific
- Dialogue must be in {language} language
- Include all sections exactly as formatted above
- Background music description should match the tone
- Lip sync text must be the exact dialogue
- STRICTLY NO SUBTITLES or text overlays in the video
- Lip sync must be highly accurate and synchronized with dialogue
- {"Show continuity from previous scenes" if scene_num > 1 else "Establish the character and setting clearly"}

Return the complete formatted output."""

            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=60.0)
                if response.status_code == 200:
                    result = response.json()
                    
                    if 'candidates' not in result or not result['candidates']:
                         logging.error(f"No candidates for scene {scene_num}: {result}")
                         continue
                         
                    candidate = result['candidates'][0]
                    if 'content' not in candidate:
                        logging.error(f"Blocked response for scene {scene_num}: {candidate}")
                        continue
                        
                    generated_text = candidate['content']['parts'][0]['text']
                    
                    # Parse the generated text
                    scene_data = {
                        "scene_number": scene_num,
                        "visual_prompt": "",
                        "dialogue": "",
                        "language": language,
                        "metadata": {
                            "duration": 8,
                            "aspect_ratio": "9:16"
                        },
                        "audio_style": {
                            "voice": f"{voice_info['description']}. Pitch/Timbre: {voice_info['type']}. Emotion: {voice_info['emotion']}.",
                            "background": ""
                        },
                        "lip_sync_data": {
                            "timing": "0.0s-8.0s",
                            "speaker": character_name.lower().replace(' ', '_'),
                            "voice_id": f"{character_name.lower().replace(' ', '_')}_{voice_info['type']}",
                            "target": f"{character_name.lower().replace(' ', '_')}_face_mesh",
                            "text": ""
                        }
                    }
                    
                     # Extract sections
                    lines = generated_text.split('\n')
                    current_section = None
                    content_buffer = []
                    
                    for line in lines:
                        if line.startswith("Visual Prompt:"):
                            current_section = "visual_prompt"
                            continue
                        elif line.startswith(f"Dialogue ({language.upper()}):") or line.startswith("Dialogue"):
                            if content_buffer and current_section == "visual_prompt":
                                scene_data["visual_prompt"] = '\n'.join(content_buffer).strip()
                                content_buffer = []
                            current_section = "dialogue"
                            continue
                        elif line.startswith("[SCENE METADATA]"):
                            if content_buffer and current_section == "dialogue":
                                dialogue_text = '\n'.join(content_buffer).strip()
                                scene_data["dialogue"] = dialogue_text
                                scene_data["lip_sync_data"]["text"] = dialogue_text
                                content_buffer = []
                            current_section = None
                            continue
                        elif line.startswith("Background:"):
                            scene_data["audio_style"]["background"] = line.replace("Background:", "").strip()
                            continue
                        
                        if current_section and line.strip():
                            content_buffer.append(line)
                    
                    if content_buffer and current_section == "dialogue":
                        dialogue_text = '\n'.join(content_buffer).strip()
                        scene_data["dialogue"] = dialogue_text
                        scene_data["lip_sync_data"]["text"] = dialogue_text
                        
                    scenes.append(scene_data)
                else:
                    print(f"Error generating scene {scene_num}: {response.status_code} - {response.text}")
        
        return {
            "total_duration": duration,
            "num_scenes": num_scenes,
            "scenes": scenes
        }

gemini_service = GeminiService()
