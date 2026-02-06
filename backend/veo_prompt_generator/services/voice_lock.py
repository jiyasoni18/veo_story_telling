"""
Voice Lock Service for Storytelling

This service generates and manages voice-locked character descriptions
to ensure consistent voice characteristics across all story scenes.
"""

import logging
from typing import Dict, List, Optional


class VoiceLockService:
    """Service for generating and managing voice-locked character descriptions"""
    
    # Predefined ambient sounds for common locations
    AMBIENT_SOUNDS = {
        'forest': 'rustling leaves, distant bird calls, wind through branches',
        'ancient forest': 'rustling leaves, distant bird calls, wind through ancient branches',
        'temple': 'echoing footsteps, distant chanting, stone acoustics',
        'sacred temple': 'echoing footsteps, distant chanting, stone acoustics',
        'mountain': 'howling wind, distant thunder, echoing silence',
        'mountain peak': 'howling wind, distant thunder, echoing silence',
        'city': 'distant traffic, footsteps on pavement, urban ambience',
        'street': 'distant traffic, footsteps on pavement, urban ambience',
        'cave': 'echoing drips, hollow acoustics, subtle reverb',
        'castle': 'crackling torches, distant footsteps, stone hall echo',
        'palace': 'echoing footsteps, distant voices, marble acoustics',
        'ocean': 'crashing waves, seagull cries, wind over water',
        'beach': 'crashing waves, seagull cries, wind over water',
        'spaceship': 'humming engines, beeping consoles, air circulation',
        'library': 'rustling pages, distant footsteps, old wood creaking',
        'garden': 'gentle breeze, rustling plants, distant water fountain',
        'room': 'quiet room tone, subtle ambient sounds',
        'office': 'quiet office, faint clock ticking, distant keyboard typing',
        'laboratory': 'humming equipment, beeping monitors, air filtration',
        'dungeon': 'echoing drips, distant chains, stone reverb',
        'battlefield': 'distant sounds of conflict, wind, tense atmosphere',
        'market': 'crowd murmur, distant vendors, bustling activity',
        'tavern': 'crackling fire, distant conversation, clinking glasses',
        'void': 'eerie silence, distant whispers, hollow emptiness',
        'default': 'ambient environmental sounds, natural atmosphere'
    }
    
    def generate_voice_anchor_block(self, character: Dict) -> str:
        """
        Generate a Voice Anchor Block from character data.
        This block will be identical across all scenes.
        
        Args:
            character: Dict with voice characteristics including:
                - name: Character name
                - age_range: e.g., "late 20s", "early 50s"
                - vocal_quality: e.g., "clear alto", "deep baritone"
                - speaking_style: e.g., "steady and purposeful"
                - accent: e.g., "soft Irish", "refined British"
                - emotional_baseline: e.g., "quiet courage", "ancient wisdom"
            
        Returns:
            Voice Anchor Block string (50-80 words)
        """
        name = character.get('name', 'Character')
        age_range = character.get('age_range', 'mid-30s')
        vocal_quality = character.get('vocal_quality', 'clear, warm voice')
        speaking_style = character.get('speaking_style', 'confident tone')
        accent = character.get('accent', 'neutral accent')
        emotional_baseline = character.get('emotional_baseline', 'calm presence')
        
        # Build the voice anchor block
        voice_anchor = (
            f"{name}, a person in their {age_range}, with a {vocal_quality}, "
            f"{speaking_style}, {accent}, speaks with {emotional_baseline}"
        )
        
        return voice_anchor
    
    def get_audio_environment(self, character: Dict) -> str:
        """
        Get consistent audio environment for character.
        
        Args:
            character: Character dict with optional 'audio_environment' field
            
        Returns:
            Audio environment descriptor string
        """
        # Use custom audio environment if provided, otherwise use default
        default_audio = "Close-mic, clean audio, warm tone, no reverb"
        return character.get('audio_environment', default_audio)
    
    def get_ambient_sound(self, location: str) -> str:
        """
        Get ambient sound for location.
        
        Args:
            location: Scene location (e.g., "forest", "temple", "city")
            
        Returns:
            Ambient sound descriptor string
        """
        # Normalize location (lowercase, strip whitespace)
        location_key = location.lower().strip() if location else 'default'
        
        # Try exact match first
        if location_key in self.AMBIENT_SOUNDS:
            return self.AMBIENT_SOUNDS[location_key]
        
        # Try partial match (e.g., "dark forest" matches "forest")
        for key, sound in self.AMBIENT_SOUNDS.items():
            if key in location_key or location_key in key:
                return sound
        
        # Return default if no match
        return self.AMBIENT_SOUNDS['default']
    
    def build_complete_scene_prompt(
        self, 
        scene_data: Dict, 
        characters: Dict, 
        location: Optional[str] = None
    ) -> str:
        """
        Build a complete voice-locked scene prompt.
        
        Args:
            scene_data: Scene information including:
                - description: Visual scene description
                - characters: List of characters in scene with dialogue
                - camera_angle: Shot type (e.g., "Wide shot", "Close-up")
                - emotion: Optional emotion for the scene
            characters: Character library with voice characteristics
            location: Scene location for ambient sound (optional)
            
        Returns:
            Complete standalone prompt with voice locking
        """
        try:
            # Extract scene information
            shot_type = scene_data.get('camera_angle', 'Medium shot')
            description = scene_data.get('description', '').strip()
            emotion = scene_data.get('emotion', '')
            scene_location = location or scene_data.get('location', 'default')
            
            # Build character voice anchors for this scene
            character_blocks = []
            dialogues = []
            audio_environments = []
            
            scene_characters = scene_data.get('characters', [])
            
            for char_data in scene_characters:
                char_name = char_data.get('name')
                if char_name and char_name in characters:
                    char_info = characters[char_name]
                    
                    # Generate voice anchor block
                    voice_anchor = self.generate_voice_anchor_block(char_info)
                    character_blocks.append(voice_anchor)
                    
                    # Get audio environment
                    audio_env = self.get_audio_environment(char_info)
                    if audio_env not in audio_environments:
                        audio_environments.append(audio_env)
                    
                    # Add dialogue if present
                    dialogue = char_data.get('dialogue', '').strip()
                    if dialogue:
                        dialogues.append(f'{char_name} says: "{dialogue}"')
            
            # Get ambient sound for location
            ambient_sound = self.get_ambient_sound(scene_location)
            
            # Use first character's audio environment (or default)
            audio_env = audio_environments[0] if audio_environments else "Close-mic, clean audio, warm tone, no reverb"
            
            # Build complete prompt following the template:
            # [SHOT TYPE]. [VOICE ANCHOR BLOCK]. [ACTION]. [DIALOGUE]. 
            # [AUDIO ENVIRONMENT]. [AMBIENT SOUND]. [VISUAL STYLE]. No subtitles.
            
            prompt_parts = []
            
            # 1. Shot type
            prompt_parts.append(f"{shot_type}.")
            
            # 2. Voice anchor blocks (all characters in scene)
            if character_blocks:
                prompt_parts.append(" ".join(character_blocks) + ".")
            
            # 3. Action/Description
            if description:
                prompt_parts.append(f"{description}.")
            
            # 4. Dialogue
            if dialogues:
                prompt_parts.append(" ".join(dialogues) + ".")
            
            # 5. Audio environment
            prompt_parts.append(f"{audio_env}.")
            
            # 6. Ambient sound
            prompt_parts.append(f"Ambient sound: {ambient_sound}.")
            
            # 7. Visual style (consistent cinematic quality)
            prompt_parts.append("Cinematic lighting, professional composition, shallow depth of field.")
            
            # 8. No subtitles
            prompt_parts.append("No subtitles.")
            
            # Join all parts
            complete_prompt = " ".join(prompt_parts)
            
            return complete_prompt
            
        except Exception as e:
            logging.error(f"Error building voice-locked prompt: {e}")
            # Return basic prompt as fallback
            return f"{scene_data.get('description', 'Scene description')}. No subtitles."
    
    def validate_character_voice_data(self, character: Dict) -> Dict:
        """
        Validate and provide defaults for character voice data.
        
        Args:
            character: Character dict
            
        Returns:
            Character dict with all required voice fields
        """
        defaults = {
            'age_range': 'mid-30s',
            'vocal_quality': 'clear, warm voice',
            'speaking_style': 'confident and steady tone',
            'accent': 'neutral accent',
            'emotional_baseline': 'calm and professional presence',
            'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
        }
        
        # Ensure all required fields exist
        for key, default_value in defaults.items():
            if key not in character or not character[key]:
                character[key] = default_value
        
        return character
    
    def generate_voice_presets(self) -> Dict[str, Dict]:
        """
        Generate preset voice configurations for common character archetypes.
        
        Returns:
            Dict of preset configurations
        """
        return {
            'wise_mentor': {
                'age_range': 'early 50s',
                'vocal_quality': 'deep, resonant voice',
                'speaking_style': 'slow and deliberate tone',
                'accent': 'refined British accent',
                'emotional_baseline': 'gentle authority and warmth, as if sharing ancient wisdom',
                'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
            },
            'young_hero': {
                'age_range': 'mid-20s',
                'vocal_quality': 'bright, energetic voice',
                'speaking_style': 'quick and enthusiastic tone',
                'accent': 'neutral American accent',
                'emotional_baseline': 'infectious optimism and determination',
                'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
            },
            'mysterious_stranger': {
                'age_range': 'late 40s',
                'vocal_quality': 'low, raspy voice',
                'speaking_style': 'slow and measured tone',
                'accent': 'faint Eastern European accent',
                'emotional_baseline': 'quiet intensity and controlled emotion',
                'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
            },
            'child_character': {
                'age_range': '8 years old',
                'vocal_quality': 'clear, high-pitched voice',
                'speaking_style': 'animated and expressive tone',
                'accent': 'neutral accent',
                'emotional_baseline': 'innocent wonder and curiosity',
                'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
            },
            'villain': {
                'age_range': 'indeterminate age',
                'vocal_quality': 'cold, echoing whisper',
                'speaking_style': 'slow and menacing tone',
                'accent': 'no discernible accent',
                'emotional_baseline': 'chilling certainty and dark amusement',
                'audio_environment': 'Distant mic, reverb-heavy, cold tone, echo effect'
            },
            'narrator': {
                'age_range': 'mid-40s',
                'vocal_quality': 'smooth, authoritative voice',
                'speaking_style': 'measured and clear tone',
                'accent': 'neutral accent',
                'emotional_baseline': 'professional storytelling presence',
                'audio_environment': 'Close-mic, clean audio, warm tone, no reverb'
            }
        }


# Create singleton instance
voice_lock_service = VoiceLockService()
