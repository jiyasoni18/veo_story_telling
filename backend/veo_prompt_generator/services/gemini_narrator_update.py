"""
Updated break_story_into_scenes function with 3 narrator modes support

Replace the existing function in gemini.py (starting at line 95) with this version
"""

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
- Narrator character provides voiceover narration (narrator_text field)
- Characters shown visually AND can also speak (dialogue field)
- Include both narrator_text and character dialogue
- Narrator describes scenes while characters can also speak
- Characters have lip-sync when they speak
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
- Example: Narrator says "The monkey asked, 'What are you eating?' The crocodile replied, 'I am eating fruit.'"
"""
    else:  # mode == "none"
        mode_instructions = """
NARRATOR MODE: None (Characters Speak Only)

RULES:
- NO narrator at all
- narrator_text field MUST be empty string ""
- ONLY characters speak with lip-sync (dialogue field)
- Pure character dialogue driven
- No voiceover narration
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
2. Use ONLY character names from the CHARACTER LIBRARY above
3. Reference character visual traits AND voice characteristics in scene descriptions
4. Follow the NARRATOR MODE rules strictly
5. Identify the LOCATION for each scene (e.g., forest, temple, city, cave, mountain, etc.)
6. NO references to "Scene 1", "Scene 2", or "previous scene" in descriptions
7. Each scene description must be STANDALONE (understandable without other scenes)

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
                lines = content.split("\n")
                content = "\n".join(lines[1:-1])
                if content.startswith("json"):
                    content = content[4:]
            
            return json.loads(content.strip(), strict=False)
        except Exception as e:
            logging.error(f"Failed to parse scene JSON: {e} | Text: {text_response}")
            return None
