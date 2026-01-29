from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import base64

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    """Generate Veo prompt using Hugging Face LLM"""
    try:
        data = request.json

        token = data.get("token")
        model = data.get("model")
        prompt = data.get("prompt")

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

        print(f"\n=== REQUEST TO HUGGING FACE ===")
        print(f"Model: {model}")
        print(f"Prompt length: {len(prompt)} chars")
        
        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=120
        )

        print(f"\n=== RESPONSE FROM HUGGING FACE ===")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', str(error_data))
            except:
                error_msg = response.text or f"HTTP {response.status_code} error"
            
            print(f"Error: {error_msg}")
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
    print("🚀 VEO ULTIMATE GENERATOR - GEMINI VISION EDITION")
    print("="*60)
    print("\n📋 Available Endpoints:")
    print("  - POST /generate       → Generate Veo prompts (Hugging Face)")
    print("  - POST /analyze_image  → Analyze images (Google Gemini)")
    print("\n💡 Image Analysis:")
    print("  ✓ Uses Google Gemini 1.5 Flash (FREE)")
    print("  ✓ Excellent vision capabilities")
    print("  ✓ Fast & reliable")
    print("  ✓ 1500 requests/day free tier")
    print("\n🔑 Get FREE Gemini API key:")
    print("  → https://makersuite.google.com/app/apikey")
    print("  → https://aistudio.google.com/app/apikey")
    print("\n🌐 Server running on: http://localhost:5001")
    print("="*60 + "\n")
    
    app.run(port=5001, debug=True)