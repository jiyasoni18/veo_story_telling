from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests
import json
import os
from dotenv import load_dotenv
import certifi

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
MONGO_URI = os.getenv('MONGODB_URI')
try:
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
    
    db = client['veo_prompt_generator']
    # SINGLE COLLECTION for everything
    user_data_collection = db['user_data']
    
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None 

from datetime import datetime

# --- Routes ---

@app.route("/api/stories", methods=["GET"])
def get_stories():
    """Retrieve all stories with their minimal metadata (no huge scene details)"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        # Fetch story titles and timestamps
        stories = list(user_data_collection.find({}, {"title": 1, "created_at": 1, "scenes_count": {"$size": "$scenes"}}))
        for s in stories:
            if '_id' in s: s['_id'] = str(s['_id'])
            
        return jsonify(stories)
    except Exception as e:
        print(f"Error in GET /api/stories: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/memory", methods=["GET"])
def get_memory():
    """Retrieve the LATEST scene state AND full story context from the most recently updated story"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500
        
    try:
        # Find the single most recently updated story
        latest_story = user_data_collection.find_one(sort=[('last_updated', -1)])
        
        if latest_story and latest_story.get('scenes'):
            # Get the very last scene added to this story
            last_scene = latest_story['scenes'][-1]
            
            # Build Context from ALL scenes
            story_context = []
            for s in latest_story['scenes']:
                # Format: "Scene 1: [Description]"
                summary = f"Scene {s.get('scene_number', '?')}: {s.get('description', '')}"
                story_context.append(summary)
            
            full_history = "\n".join(story_context)

            # Construct the state object expected by frontend
            state = {
                "enabled": True, # Default to true if loaded
                "storyTitle": latest_story.get('title', ''),
                "sceneNumber": last_scene.get('scene_number', 1),
                "currentSceneDescription": last_scene.get('description', ''),
                "lastGeneratedPrompt": last_scene.get('generated_prompt', ''),
                "setting": last_scene.get('setting', ''),
                "lighting": last_scene.get('lighting', ''),
                "timeOfDay": last_scene.get('time_of_day', ''),
                "characters": last_scene.get('characters', {}),
                "storyContext": full_history  # NEW FIELD
            }
            return jsonify(state)
        else:
            # Return empty default state
            return jsonify({
                "enabled": True,
                "storyTitle": "",
                "characters": {},
                "setting": "",
                "lighting": "",
                "timeOfDay": "",
                "storyContext": "" # NEW FIELD
            })
            
    except Exception as e:
        print(f"Error in GET /api/memory: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/memory", methods=["POST"])
def save_memory():
    """Save a SCENE to a STORY (Create story if new, append scene if exists) and return updated context"""
    if db is None:
        return jsonify({"error": "Database not connected"}), 500

    try:
        data = request.json
        story_title = data.get('storyTitle', '').strip()
        
        if not story_title:
             return jsonify({"error": "Story Title is required"}), 400

        # Prepare the scene object
        current_scene = {
            "scene_number": data.get('sceneNumber', 1),
            "description": data.get('currentSceneDescription', ''),
            "generated_prompt": data.get('lastGeneratedPrompt', ''),
            "characters": data.get('characters', {}),
            "setting": data.get('setting', ''),
            "lighting": data.get('lighting', ''),
            "time_of_day": data.get('timeOfDay', ''),
            "created_at": datetime.utcnow()
        }

        # Check if story exists (Case insensitive check could be better, but simple match for now)
        existing_story = user_data_collection.find_one({"title": story_title})
        
        updated_scenes = []

        if existing_story:
            # APPEND to existing story
            user_data_collection.update_one(
                {"_id": existing_story["_id"]},
                {
                    "$push": {"scenes": current_scene},
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
            # Fetch updated list for context
            updated_story = user_data_collection.find_one({"_id": existing_story["_id"]})
            updated_scenes = updated_story.get('scenes', [])
            message = f"Scene added to existing story: '{story_title}'"
        else:
            # CREATE new story document
            new_story = {
                "title": story_title,
                "created_at": datetime.utcnow(),
                "last_updated": datetime.utcnow(),
                "scenes": [current_scene]
            }
            user_data_collection.insert_one(new_story)
            updated_scenes = [current_scene]
            message = f"New story created: '{story_title}' with first scene"

        # Build Updated Context
        story_context = []
        for s in updated_scenes:
            summary = f"Scene {s.get('scene_number', '?')}: {s.get('description', '')}"
            story_context.append(summary)
        
        full_history = "\n".join(story_context)

        return jsonify({
            "status": "success", 
            "message": message,
            "storyContext": full_history # Return the fresh history
        })
        
    except Exception as e:
        print(f"Error in POST /api/memory: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/reset", methods=["POST"])
def reset_memory():
    """Clear ALL stories? Limit to specific story?"""
    # For safety, let's keep it to clearing everything logic for now or disable it
    if db is None:
         return jsonify({"error": "Database not connected"}), 500
    
    # user_data_collection.delete_many({}) # Dangerous!
    return jsonify({"status": "error", "message": "Reset all disabled for safety in Story Mode"})


@app.route("/generate", methods=["POST"])
def generate():
    """Generate Veo prompt using either Hugging Face LLM or Google Gemini"""
    try:
        data = request.json

        token = data.get("token")
        model = data.get("model")
        prompt = data.get("prompt")
        provider = data.get("provider", "huggingface") # Default to HF

        print(f"\n=== GENERATION REQUEST ===")
        print(f"Provider: {provider}")
        
        # --- GOOGLE GEMINI GENERATION ---
        if provider == 'gemini':
            print(f"Model: gemini-2.5-flash (Google)")
            if not token:
                return jsonify({"error": "Gemini API Key is missing"}), 400

            # Use v1 stable endpoint
            api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={token}"
            
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                }
            }

            headers = {"Content-Type": "application/json"}
            
            print(f"Calling Gemini API: {api_url.split('?')[0]}...") # Log URL without key
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    generated_text = result['candidates'][0]['content']['parts'][0]['text']
                    return jsonify([{"generated_text": generated_text}])
                else:
                    return jsonify({"error": "No candidates returned from Gemini"}), 500
            else:
                print(f"Gemini Error Body: {response.text}")
                return jsonify({"error": f"Gemini API Error ({response.status_code}): {response.text}"}), response.status_code

        # --- HUGGING FACE GENERATION (Default) ---
        else:
            print(f"Model: {model}")
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.7,
                "top_p": 0.95,
                "stream": False
            }
            
            response = requests.post(
                "https://router.huggingface.co/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=120
            )

            if response.status_code != 200:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('error', str(error_data))
                except:
                    error_msg = response.text or f"HTTP {response.status_code} error"
                return jsonify({"error": error_msg}), response.status_code

            result = response.json()
            
            if isinstance(result, dict) and 'choices' in result:
                generated_text = result['choices'][0]['message']['content']
                return jsonify([{"generated_text": generated_text}])
            else:
                return jsonify(result)
        
    except Exception as e:
        print(f"\n=== ERROR ===")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/analyze_image", methods=["POST"])
def analyze_image():
    """Analyze character image using Google Gemini Vision API (FREE)"""
    try:
        data = request.json
        gemini_key = data.get("gemini_key")
        image_data = data.get("image")
        
        if not gemini_key:
            return jsonify({
                "error": "Missing Gemini API key",
                "instructions": "Get free key at: https://makersuite.google.com/app/apikey"
            }), 400
        
        if not image_data:
            return jsonify({"error": "Missing image data"}), 400
        
        print(f"\n=== GEMINI IMAGE ANALYSIS ===")
        
        # Extract base64 data
        if 'base64,' in image_data:
            image_base64 = image_data.split('base64,')[1]
        else:
            image_base64 = image_data
        
        # Determine mime type from prefix
        mime_type = "image/jpeg"
        if 'data:image/png' in image_data:
            mime_type = "image/png"
        elif 'data:image/webp' in image_data:
            mime_type = "image/webp"
        
        print(f"Image size: {len(image_base64)} chars")
        print(f"Mime type: {mime_type}")
        
        # Gemini API endpoint (using current stable model: Gemini 2.5 Flash)
        api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={gemini_key}"
        
        # Ultra-detailed prompt that detects BOTH character details AND visual style
        prompt = """CHARACTER ANALYSIS - DESCRIPTION + VISUAL STYLE DETECTION

PART 1: VISUAL STYLE IDENTIFICATION
First, identify the VISUAL/ARTISTIC STYLE of this image. Choose ONE from these categories:
- Cinematic Photorealism (realistic human, photo-like)
- 3D Animation (Pixar/Disney Style) (3D rendered, cartoon-like but dimensional)
- 2D Anime Style (Japanese anime/manga art style)
- Digital AI Avatar (digital/CGI humanoid character)
- Cyberpunk/Futuristic (sci-fi, neon, futuristic aesthetic)
- Oil Painting Art Style (painterly, artistic, classical art look)
- Vintage Film (1950s) (old film aesthetic, grainy, retro)

Start with: "VISUAL STYLE: [style name]"

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
- Use specific color names (not generic terms)
- Keep character description 150-200 words
- No bullet points in the description
- No preamble or introduction

EXAMPLE OUTPUT FORMAT:
VISUAL STYLE: 3D Animation (Pixar/Disney Style)

[Character description paragraph here...]

START YOUR ANALYSIS NOW:
"""

        # Gemini API payload format with higher temperature for more verbose output
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        },
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.9,
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"Calling Gemini Flash...")
        
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract text from Gemini response
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    parts = candidate['content']['parts']
                    if len(parts) > 0 and 'text' in parts[0]:
                        full_response = parts[0]['text'].strip()
                        
                        # Clean up
                        full_response = full_response.replace('"', '').strip()
                        
                        # Remove common prefixes
                        for prefix in ['Here is', 'Here\'s', 'This is', 'The image shows']:
                            if full_response.startswith(prefix):
                                lines = full_response.split('\n')
                                full_response = '\n'.join(lines[1:]).strip()
                                break
                        
                        # Parse visual style and description
                        visual_style = "Cinematic Photorealism"  # Default
                        description = full_response
                        
                        # Extract visual style if present
                        if "VISUAL STYLE:" in full_response:
                            lines = full_response.split('\n')
                            for i, line in enumerate(lines):
                                if line.strip().startswith("VISUAL STYLE:"):
                                    # Extract the style
                                    visual_style = line.replace("VISUAL STYLE:", "").strip()
                                    # Remove the visual style line and get the rest as description
                                    description = '\n'.join(lines[i+1:]).strip()
                                    break
                        
                        print(f"\n✓ Detected Visual Style: {visual_style}")
                        print(f"✓ Got description: {description[:100]}...")
                        
                        return jsonify({
                            "description": description,
                            "visual_style": visual_style,
                            "source": "Gemini 2.5 Flash"
                        })
            
            print(f"Unexpected response format: {json.dumps(result, indent=2)[:500]}")
            return jsonify({
                "error": "Unexpected response format from Gemini",
                "details": str(result)
            }), 500
        
        else:
            error_text = response.text
            print(f"Error: {error_text[:500]}")
            
            try:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', error_text)
            except:
                error_message = error_text
            
            return jsonify({
                "error": f"Gemini API error: {error_message}",
                "status": response.status_code
            }), response.status_code
        
    except Exception as e:
        print(f"\n=== ERROR ===")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "message": "Failed to analyze image. Check your Gemini API key."
        }), 500



@app.route("/api/v1/educational/generate-prompt", methods=["POST"])
def generate_educational_prompt():
    """Generate complete educational health content prompt(s) - supports multi-scene with Rich Character Expressions"""
    try:
        data = request.json
        character_name = data.get('character_name')
        voice_tone = data.get('voice_tone')
        topic_type = data.get('topic_type') # 'health_benefit' or 'side_effect'
        language = data.get('language')
        total_duration = data.get('duration', 8)
        
        # New Inputs
        visual_style = data.get('visual_style', '3d_cartoon') # '3d_cartoon', 'realistic', 'cinematic'
        custom_description = data.get('custom_description', '') # Optional user string

        if not all([character_name, voice_tone, topic_type, language]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Calculate number of scenes (each scene is 8 seconds)
        num_scenes = total_duration // 8
        
        # --- 1. Map Inputs to Rich Expression Logic ---
        
        # Map simple voice_tone to complex expression
        expression_map = {
            "friendly": "happy",
            "angry": "angry",
            "serious": "angry",
            "educational": "wise"
        }
        expression = expression_map.get(voice_tone, "friendly")
        
        # Dynamic Tone & Style Definitions
        styles = {
            "happy": {
                "tone_desc": "Ecstatic, joyful, high energy, upbeat, very positive.",
                "dialogue_style": "Dialogue should be extremely enthusiastic. Focus on the joy of being healthy/tasty.",
                "hindi_example": "Arre waah! Main toh superfood hoon! Mujhe khaoge toh superman ban jaoge!"
            },
            "funny": {
                "tone_desc": "Witty, sarcastic, pun-filled, comedic, cheeky.",
                "dialogue_style": "Dialogue MUST be a joke, a pun, or a roast. Make it laugh-out-loud funny.",
                "hindi_example": "Main itna cool hoon ki fridge bhi mujhe dekh ke jal jaata hai!"
            },
            "angry": {
                "tone_desc": "Stern, Serious, Warning, Dark, Authoritative.",
                "dialogue_style": "The character warns the human about their poor choices. It speaks with INTENSITY and AUTHORITY, but not uncontrollable screaming. Like a strict teacher or villain.",
                "hindi_example": "Main hoon Karela. Darta kyu hai? Meri kadwahat hi tera ilaaj hai."
            },
            "sad": {
                "tone_desc": "Tragic, weeping, depressed, emotional, melodramatic.",
                "dialogue_style": "Dialogue MUST be sorrowful. Crying about its fate. Begging not to be cut/eaten. Use 'Haye Ram' or similar.",
                "hindi_example": "Haye... meri kismat toh dekho... bas ab soup banna hi likha hai... (sobbing)"
            },
            "scared": {
                "tone_desc": "Terrified, trembling, panic-stricken, stammering.",
                "dialogue_style": "Dialogue should show panic. Stuttering, asking for mercy.",
                "hindi_example": "N-n-nahi! Wo... wo chaku neeche rakho! Mujhe dar lag raha hai!"
            },
            "wise": {
                "tone_desc": "Old, slow, philosophical, grand, grandmotherly/grandfatherly.",
                "dialogue_style": "Dialogue should sound like an old wise person giving advice.",
                "hindi_example": "Beta, meri baat suno... jo hari sabzi khata hai, wahi lambi umar paata hai."
            },
            "surprised": {
                "tone_desc": "Shocked, gasping, disbelief, wide-eyed.",
                "dialogue_style": "Dialogue should express total disbelief at a fact or situation.",
                "hindi_example": "Hain?? Sach mein?? Mujhe toh pata hi nahi tha main itna faydemand hoon!"
            }
        }
        
        current_style = styles.get(expression, styles["happy"])
        
        # Audio/Voice Mapping
        # Audio/Voice Mapping
        voice_mapping = {
            # Emotion-based (Legacy support)
            "angry": {"type": "male_deep", "description": "Deep, resonant, strong MALE voice", "emotion": "angry"},
            "friendly": {"type": "female_bright", "description": "Warm, friendly, upbeat FEMALE voice", "emotion": "cheerful"},
            "educational": {"type": "male_medium", "description": "Strong, clear, authoritative MALE voice", "emotion": "educational"},
            "serious": {"type": "male_deep", "description": "Deep, serious, professional MALE voice", "emotion": "serious"},
            
            # Specific Voice Types (From Frontend)
            "male_deep": {"type": "male_deep", "description": "Deep, resonant, strong MALE voice", "emotion": expression},
            "male_medium": {"type": "male_medium", "description": "Casual, conversational MALE voice", "emotion": expression},
            "male_soft": {"type": "male_soft", "description": "Gentle, soft-spoken MALE voice", "emotion": expression},
            "female_deep": {"type": "female_deep", "description": "Mature, deep FEMALE voice", "emotion": expression},
            "female_medium": {"type": "female_medium", "description": "Casual, conversational FEMALE voice", "emotion": expression},
            "female_soft": {"type": "female_soft", "description": "Sweet, soft-spoken FEMALE voice", "emotion": expression},
            "child_male": {"type": "child_male", "description": "Young BOY voice", "emotion": expression},
            "child_female": {"type": "child_female", "description": "Young GIRL voice", "emotion": expression},
            "cartoon_squeaky": {"type": "cartoon_squeaky", "description": "High-pitched, funny CARTOON squeaky voice", "emotion": expression}
        }
        
        # Determine voice info - support both direct keys and mapped keys
        voice_info = voice_mapping.get(voice_tone, voice_mapping.get("educational"))
        if not voice_info:
             # Fallback if weird key
             voice_info = voice_mapping["educational"]
        voice_id_prefix = f"{character_name.lower().replace(' ', '_')}_{voice_info['type']}"

        # Topic Mapping
        topic_key = 'side_effects' if topic_type == 'side_effect' else 'benefits'
        
        # Language Setup
        language_name = "ENGLISH" if language.lower() == 'english' else "HINDI (Devanagari)"
        dialogue_placeholder = "[English Dialogue Here]" if language.lower() == 'english' else "[Hindi Dialogue Here]"
        style_example = "Hey! Put down those flavorless chips! I am standing right here!" if language.lower() == 'english' else current_style["hindi_example"]
        
        # Scenario extraction
        scenario_desc = data.get('scenario', ("Warning about health risks" if topic_key == 'side_effects' else "Explaining benefits"))

        # Gemini API setup
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        # Generate prompts for each scene
        scenes = []
        
        for scene_num in range(1, num_scenes + 1):
            
            # --- 2. Determine Part Context & Story Arc (The Scenario Logic) ---
            part_context = ""
            story_role = ""
            transition_instruction = ""
            
            # --- TOPIC: BENEFITS (Classic Mode) ---
            if topic_key == 'benefits':
                if scene_num == 1:
                    story_role = "INTRO & IDENTITY"
                    part_context = f"""PART 1 of {num_scenes} (INTRO). 
                    Content: The character MUST start by saying "Main hoon {character_name}" (I am {character_name}). Then grab attention.
                    Constraint: Do NOT list all benefits yet. Establish identity first.
                    Context: {current_style['dialogue_style']}"""
                    transition_instruction = "OPENING SHOT: Establish the character in the environment."
                elif scene_num == num_scenes:
                    story_role = "CONCLUSION & CALL TO ACTION"
                    part_context = f"""PART {scene_num} of {num_scenes} (CONCLUSION). 
                    Content: Final ultimatum. "Eat me or else!" or "Please pick me!".
                    Constraint: Do NOT start a new topic. Wrap up the rant/speech with a strong punchline.
                    Context: {current_style['tone_desc']}"""
                    transition_instruction = "CLOSING SHOT: Build to a climax/final pose. Fade out ONLY at the very end."
                else:
                    story_role = "VALUE & CONFLICT"
                    transition_desc = "The character moves/zooms into a new environment (body/nature)." if scene_num == 2 else "Continue from previous part's environment."
                    part_context = f"""PART {scene_num} of {num_scenes} (VALUE & CONFLICT). 
                    TRANSITION: {transition_desc}
                    Content: The character mentions a SPECIFIC weird benefit (e.g. 'I clean your insides') or compares to junk food.
                    Constraint: Do NOT re-introduce the character. Move the story forward.
                    Context: {current_style['tone_desc']}"""
                    transition_instruction = "CONTINUOUS ACTION: Seamlessly continue. Do NOT re-introduce."

            # --- TOPIC: SIDE EFFECTS (Warning Mode) ---
            else: 
                if scene_num == 1:
                    story_role = "DECEPTIVE HOOK"
                    part_context = f"""PART 1 of {num_scenes} (DECEPTIVE HOOK). 
                    Content: The character MUST start by saying "Main hoon {character_name}" (I am {character_name}). Then hint at danger.
                    Constraint: Introduce the item as a temptation/danger.
                    Context: {current_style['dialogue_style']}"""
                    transition_instruction = "OPENING SHOT: Establish the character in the environment."
                elif scene_num == num_scenes:
                    story_role = "CONSEQUENCE (MOCKING)"
                    part_context = f"""PART {scene_num} of {num_scenes} (CONSEQUENCE). 
                    Content: The character mocks the user for the long-term consequences (obesity, diabetes).
                    Constraint: A final warning or mocking laugh.
                    Context: {current_style['tone_desc']}"""
                    transition_instruction = "CLOSING SHOT: Build to a climax/final pose. Fade out ONLY at the very end."
                else:
                    story_role = "INTERNAL BODY DAMAGE"
                    transition_desc = "The character ENTERS the human body. Show a smooth zoom/dive transition from external to internal view (camera follows character shrinking and entering through mouth/skin, traveling through throat into bloodstream)." if scene_num == 2 else "Continue inside the body from previous organ/system."
                    
                    part_context = f"""PART {scene_num} of {num_scenes} (INTERNAL BODY DAMAGE). 
                    TRANSITION: {transition_desc}
                    Content: The character ({character_name}) is depicted INSIDE the human body, actively causing damage.
                    VISUAL REQUIREMENT: 
                    - SETTING: Microscopic view inside a human organ (veins, heart, brain, liver) affected by {character_name}.
                    - ACTION: Show {character_name} particles or the character physically harming cells. 
                    - CHARACTER: The main {character_name} character is floating in this internal space, commanding the destruction or laughing at the damage.
                    - STYLE: Medical Animation / realistic biological texture mixed with the character's style.
                    Context: Describing the immediate physiological harm."""
                    transition_instruction = f"TRANSITION SHOT: {transition_desc}"


            # --- 3. Dynamic Instructions ---
            topic_instructions = ""
            if topic_key == 'side_effects':
                topic_instructions = f"""
                CRITICAL INSTRUCTIONS (SIDE EFFECTS MODE):
                1. Topic: {character_name} HARMS the human body.
                2. If the emotion is Happy, be arrogantly happy about causing harm (Villain vibe).
                """
            else:
                topic_instructions = f"""
                CRITICAL INSTRUCTIONS (BENEFITS MODE):
                1. Topic: {character_name} HELPS the human body.
                2. Focus on strength, vitality, and health.
                """

            # --- 4. System Prompt ---
            system_prompt = f"""You are a creative scriptwriter for animated shorts.
Task: Create a script for Part {scene_num} of a {num_scenes}-part series.
Character: {character_name} (A living, talking ingredient).
Emotion: {expression} (Strictly enforced).

IMPORTANT: Return PLAIN TEXT. Do not wrap the entire response in ```json or ``` code blocks.

CRITICAL VISUAL RULE (IMAGE CONSISTENCY):
1. **ALWAYS** refer to the character as "**The character (reference image)**".
2. **NEVER** describe the character's face, eyes, mouth, or shape. The image is already provided.
3. If you describe the character, the video generation will FAIL.
4. **Scene 2, 3, 4 MUST include the character.** Do not show just the background.

BACKGROUND & SETTING STRATEGY (STRICT ENFORCEMENT):
- **Analyze the Ingredient:** {character_name}.
- **If Benefit OR Intro (Part 1):** NORMAL REALISTIC KITCHEN.
   - **SETTING:** A clean, modern kitchen surface (table, marble counter, or wooden cutting board). 
   - **VIBE:** Bright, airy, domestic. slightly blurred background.
   - **CHARACTER POSITION:** Sitting or standing on the surface.
- **If Side Effect (Middle/End):** FUTURISTIC INTERNAL BODY CHAMBER.
   - **SETTING:** A dark, sterile, internal body chamber, resembling a futuristic medical facility.
   - **DETAILS:** Faint, intricate lines, like neural pathways or constricted capillaries, glow dimly in the background. Hinting at vital systems under strain.
   - **VIBE:** Menacing, sterile, high-tech biological, low hum.
   - **CHARACTER POSITION:** The character is HOVERING/FLOATING in the center, slowly rotating.
   - **RESTRICTION:** NO landscapes, NO ground, NO sky. Just the dark, sterile internal environment.

VEO COMPATIBILITY RULES (NEGATIVE PROMPT):
- **NO text overlays, NO subtitles, NO watermarks.**
- **NO split screens, NO chaotic fast cuts.**
- **NO man-made logos or branding.**
- The video must be a single, smooth, cinematic shot (slow pan, zoom, or push-in).

VISUAL STYLE: {visual_style.upper()}
{'STYLE GUIDE: Pixar-style 3D render, smooth textures, vibrant colors, soft lighting.' if visual_style == '3d_cartoon' else 'STYLE GUIDE: Photorealistic Medical/Cinematic, high detail, dramatic lighting, 8k resolution.'}

[REQUIRED OUTPUT FORMAT]
Visual Prompt: CINEMATIC DIRECTING - HIGHLY DETAILED ENVIRONMENTAL STORYTELLING.

**CRITICAL:** The visual prompt must be EXTENSIVE and CINEMATIC (minimum 150 words). Include:
- Opening transition (FADE IN, camera movement)
- Detailed environmental description (textures, formations, atmosphere)
- Lighting description (quality, color, mood, shadows)
- Visual metaphors related to {character_name}'s impact
- Character placement and subtle action
- Closing with camera movement
- End with negative prompt list

Structure (LONG FORM):
"FADE IN from black to [extensive environment description - 2-3 sentences]. [Detailed atmospheric elements, textures, formations - 2-3 sentences]. [Lighting description with mood and color - 1-2 sentences]. [Visual metaphors and symbolic elements - 1-2 sentences]. [Character placement and action]. The camera maintains a [camera movement] across this [adjective] vista, establishing the character's world.
NO text overlays, NO subtitles, NO watermarks, NO jump cuts, NO fast cuts, NO neon colors, NO cluttered backgrounds, NO man-made logos."

**EXAMPLES:**

*(Side Effect - Sugar - Internal Body)*
"FADE IN from black to a desolate, otherworldly landscape composed entirely of immense, decaying sugar crystal formations. The environment is a conceptual representation of sugar's negative impact. Jagged, brittle crystalline structures, once potentially pristine, are now cracked and crumbling, revealing a sticky, viscous, pale yellow goo oozing from within. Large, oppressive formations loom in the background, their surfaces dulled and corroded, appearing sickly sweet rather than alluring. The atmosphere is heavy and suffocating, with a visible, fine sugar dust suspended in the air that feels more like a pollutant than a sparkle. Dark, deep shadows are cast by the towering, misshapen crystal spires, creating a sense of foreboding. Dynamic, low-key lighting emphasizes the decay, with a sickly, almost jaundiced glow subtly pulsating from deeper fissures in the structures. Visual metaphors of stress and deterioration are abundant: intricate crystalline patterns appear distorted, some formations are visibly slumping, and the overall impression is one of a once beautiful structure now collapsing under its own corrupted nature. **The character (reference image)** hovers ominously in the center of this corrupted realm. The camera maintains a steady, cinematic, slow push-in across this ominous, sugar-laden vista, establishing the character's corrupted world.
NO text overlays, NO subtitles, NO watermarks, NO jump cuts, NO fast cuts, NO neon colors, NO cluttered backgrounds, NO man-made logos."

*(Benefit - Spinach - Kitchen)*
"FADE IN from black to a bright, inviting, modern kitchen bathed in warm, natural sunlight streaming through a large window. The environment radiates health and vitality. A pristine marble countertop stretches across the frame, its surface gleaming and spotless, reflecting the soft, golden light. In the background, slightly out of focus, fresh vegetables in a woven basket and potted herbs on the windowsill create a sense of organic abundance and domestic harmony. The atmosphere is clean, airy, and wholesome, with motes of dust dancing gently in the sunbeams, adding a touch of life and movement. Soft, diffused lighting creates gentle highlights and minimal shadows, emphasizing the purity and freshness of the setting. Visual metaphors of growth and nourishment are present: the vibrant green of the herbs, the natural textures of wood and stone, and the overall sense of a space dedicated to healthy living. **The character (reference image)** stands proudly on the cutting board, radiating energy and confidence. The camera holds a steady, medium shot, slowly dollying in to emphasize the character's presence in this wholesome environment.
NO text overlays, NO subtitles, NO watermarks, NO jump cuts, NO fast cuts, NO neon colors, NO cluttered backgrounds, NO man-made logos."

Dialogue ({language_name}): "[Unique {language_name} Dialogue reflecting {character_name}'s personality]"

[SCENE METADATA]
Duration: 8 seconds
Aspect Ratio: 9:16

[AUDIO STYLE]
Voice: {voice_info['description']}. MUST BE CONSISTENT. Pitch/Timbre: {voice_info['type']}. Emotion: {expression}.
Background: Consistent ambient. Match emotion.

[LIP SYNC DATA]
0.0s-8.0s
Speaker: {character_name.lower().replace(' ', '_')}
Voice ID: {voice_id_prefix}
Lip Sync Target: {character_name.lower().replace(' ', '_')}_face_mesh
Text: "{dialogue_placeholder}"
"""

            # --- 5. User Prompt ---
            user_prompt = f"""Generate the prompt for Part {scene_num} of {num_scenes}.
Ingredient: {character_name}
Topic: {"Negative Side Effects/Health Risks" if topic_key == 'side_effects' else "Health Benefits"}
STORY ARC: {story_role}
Specific Instructions: {part_context}
Camera Instruction: {transition_instruction}
User Bonus Instructions: {custom_description if custom_description else "None"}

{topic_instructions}

CRITICAL RULES:
1. **DIALOGUE TIMING (STRICT):**
   - **MAXIMUM 15 WORDS.**
   - The dialogue must fit TIGHTLY within 8 seconds.
   - **PERFECT LENGTH EXAMPLE:** "Kya socha tha? Motapa, sugar... ye sab mere hi to khel hain. Ab bhugto!" (12 words)
   - **TOO LONG EXAMPLE:** "Main tumhara pasandida drink hoon jo tumhe bimar karta hai aur tumhari haddiyo ko galata hai isliye mujhe mat piyo." (Too long)
   - Do NOT write a paragraph. 2-3 short, punchy sentences max.
2. **VISUAL CONTINUITY:**
   - **Part 1:** Start in the Kitchen/Fridge/Table (External View).
   - **Part 2+:** ZOOM INSIDE THE BODY. Show the damage or benefit happening MICROSCOPICALLY.
   - **ALWAYS** include "**The character (reference image)**" in the visual prompt.
3. The dialogue must be completely UNIQUE and in {language_name}.
4. **USER INSTRUCTIONS:** If the user provided bonus instructions above, prioritize them for the background/setting logic.

Example of Style (DO NOT COPY TEXT, ONLY TONE): "{style_example}"
ENSURE the valid JSON-like lip sync block is included at the end.
"""
            
            # Combine
            full_prompt = system_prompt + "\n\n" + "[USER REQUEST]" + "\n" + user_prompt

            # Call Gemini API for this scene
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}]
            }
            
            response = requests.post(url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result['candidates'][0]['content']['parts'][0]['text']
                
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
                        "voice_id": voice_id_prefix,
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
                    elif line.startswith(f"Dialogue ({language_name}):") or line.startswith("Dialogue"):
                        if content_buffer and current_section == "visual_prompt":
                            scene_data["visual_prompt"] = '\n'.join(content_buffer).strip()
                            content_buffer = []
                        current_section = "dialogue"
                        continue
                    elif line.startswith("[SCENE METADATA]"):
                        if content_buffer and current_section == "dialogue":
                            dialogue_text = '\n'.join(content_buffer).strip()
                            # Clean up dialogue (remove quotes if present)
                            dialogue_text = dialogue_text.strip('"').strip("'")
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
                
                # Handle remaining content
                if content_buffer:
                    if current_section == "dialogue":
                        dialogue_text = '\n'.join(content_buffer).strip().strip('"').strip("'")
                        scene_data["dialogue"] = dialogue_text
                        scene_data["lip_sync_data"]["text"] = dialogue_text
                    else:
                        pass
                
                scenes.append(scene_data)
            else:
                return jsonify({"error": f"Gemini API request failed for scene {scene_num}"}), 500
        
        # Return all scenes
        return jsonify({
            "total_duration": total_duration,
            "num_scenes": num_scenes,
            "scenes": scenes
        })
            
    except Exception as e:
        print(f"Error in educational generation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



@app.route("/api/v1/ai/generate-talking-character", methods=["POST"])
def generate_talking_character():
    """Generate Talking Veggies / Objects prompt"""
    try:
        data = request.json
        character_type = data.get('character_type')
        topic = data.get('topic')
        language = data.get('language')
        personality = data.get('personality')
        
        if not all([character_type, topic, language, personality]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Build Gemini prompt
        gemini_prompt = f"""Generate a Veo video prompt for a talking character.

CHARACTER TYPE: {character_type}
TOPIC OF SPEECH: {topic}
LANGUAGE: {language}
PERSONALITY: {personality}

REQUIREMENTS:
1. Create a vivid visual description of the {character_type} character
2. The character should be anthropomorphized (with face, expressions, gestures)
3. Generate a short, engaging speech about {topic} in {language}
4. The character's personality should be {personality}
5. Include camera angles, lighting, and setting details
6. Make it fun, entertaining, and suitable for video generation
7. Include lip-sync and dialogue markers
8. Keep the total prompt 150-250 words

OUTPUT FORMAT:
Write a single, cohesive Veo prompt that includes:
- Visual description of the character and setting
- Character's dialogue in {language}
- Camera specifications
- Lighting and atmosphere
- Character gestures and expressions matching the {personality} personality

Make it vivid, entertaining, and ready for Veo video generation.

Return ONLY the final prompt text."""

        # Call Gemini API
        GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{"parts": [{"text": gemini_prompt}]}]
        }
        
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            generated_prompt = result['candidates'][0]['content']['parts'][0]['text']
            
            return jsonify({"generated_prompt": generated_prompt})
        else:
            return jsonify({"error": "Gemini API request failed"}), 500
            
    except Exception as e:
        print(f"Error in talking character generation: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "="*60)
    print("VEO ULTIMATE GENERATOR - MONGODB EDITION")
    print("="*60)
    print("\nAvailable Endpoints:")
    print("  - POST /generate       -> Generate Veo prompts")
    print("  - POST /analyze_image  -> Analyze images")
    print("  - GET  /api/memory     -> Load state from MongoDB")
    print("  - POST /api/memory     -> Save state to MongoDB")
    print("\nServer running on: http://localhost:5001")
    print("="*60 + "\n")
    
    app.run(port=5001, debug=True)
