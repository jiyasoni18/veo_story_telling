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
