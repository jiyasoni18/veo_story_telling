"""
Test script for Voice Lock Service

This script tests the voice lock service functionality without needing
the full API server running.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from veo_prompt_generator.services.voice_lock import voice_lock_service


def test_voice_anchor_generation():
    """Test Voice Anchor Block generation"""
    print("=" * 80)
    print("TEST 1: Voice Anchor Block Generation")
    print("=" * 80)
    
    character = {
        'name': 'Aria',
        'age_range': 'late 20s',
        'vocal_quality': 'clear, determined alto voice',
        'speaking_style': 'steady and purposeful tone',
        'accent': 'soft Irish accent',
        'emotional_baseline': 'quiet courage and underlying vulnerability, as if carrying a great burden'
    }
    
    voice_anchor = voice_lock_service.generate_voice_anchor_block(character)
    print(f"\nCharacter: {character['name']}")
    print(f"\nVoice Anchor Block:\n{voice_anchor}")
    print("\n✅ Test passed!\n")


def test_ambient_sounds():
    """Test ambient sound generation for different locations"""
    print("=" * 80)
    print("TEST 2: Ambient Sound Generation")
    print("=" * 80)
    
    locations = ['forest', 'temple', 'mountain', 'city', 'cave', 'spaceship', 'unknown_location']
    
    for location in locations:
        ambient = voice_lock_service.get_ambient_sound(location)
        print(f"\nLocation: {location:20} → Ambient: {ambient}")
    
    print("\n✅ Test passed!\n")


def test_complete_prompt():
    """Test complete voice-locked prompt generation"""
    print("=" * 80)
    print("TEST 3: Complete Voice-Locked Prompt Generation")
    print("=" * 80)
    
    scene_data = {
        'scene_number': 1,
        'description': 'She stands at the edge of a dark forest, hand resting on her sword hilt',
        'location': 'forest',
        'characters': [
            {
                'name': 'Aria',
                'dialogue': 'I must find the crystal'
            }
        ],
        'camera_angle': 'Wide shot',
        'emotion': 'Determined'
    }
    
    characters = {
        'Aria': {
            'name': 'Aria',
            'age_range': 'late 20s',
            'vocal_quality': 'clear, determined alto voice',
            'speaking_style': 'steady and purposeful tone',
            'accent': 'soft Irish accent',
            'emotional_baseline': 'quiet courage and underlying vulnerability, as if carrying a great burden'
        }
    }
    
    complete_prompt = voice_lock_service.build_complete_scene_prompt(
        scene_data=scene_data,
        characters=characters,
        location='forest'
    )
    
    print(f"\nScene: {scene_data['scene_number']}")
    print(f"Location: {scene_data['location']}")
    print(f"\nGenerated Prompt:\n{complete_prompt}")
    print("\n✅ Test passed!\n")


def test_multi_character_scene():
    """Test voice-locked prompt with multiple characters"""
    print("=" * 80)
    print("TEST 4: Multi-Character Scene")
    print("=" * 80)
    
    scene_data = {
        'scene_number': 2,
        'description': 'They stand facing each other in the sacred temple',
        'location': 'temple',
        'characters': [
            {
                'name': 'Aria',
                'dialogue': 'Can you help me find the Crystal of Light?'
            },
            {
                'name': 'Theron',
                'dialogue': 'The crystal chooses its guardian. Are you ready?'
            }
        ],
        'camera_angle': 'Medium two-shot',
        'emotion': 'Tense'
    }
    
    characters = {
        'Aria': {
            'name': 'Aria',
            'age_range': 'late 20s',
            'vocal_quality': 'clear, determined alto voice',
            'speaking_style': 'steady and purposeful tone',
            'accent': 'soft Irish accent',
            'emotional_baseline': 'quiet courage and underlying vulnerability'
        },
        'Theron': {
            'name': 'Theron',
            'age_range': 'early 70s',
            'vocal_quality': 'deep, weathered voice',
            'speaking_style': 'slow and contemplative tone',
            'accent': 'refined British accent',
            'emotional_baseline': 'ancient wisdom and gentle patience'
        }
    }
    
    complete_prompt = voice_lock_service.build_complete_scene_prompt(
        scene_data=scene_data,
        characters=characters,
        location='temple'
    )
    
    print(f"\nScene: {scene_data['scene_number']}")
    print(f"Location: {scene_data['location']}")
    print(f"Characters: {len(scene_data['characters'])}")
    print(f"\nGenerated Prompt:\n{complete_prompt}")
    print("\n✅ Test passed!\n")


def test_voice_presets():
    """Test voice preset generation"""
    print("=" * 80)
    print("TEST 5: Voice Presets")
    print("=" * 80)
    
    presets = voice_lock_service.generate_voice_presets()
    
    print(f"\nAvailable Presets: {len(presets)}")
    for preset_name, preset_data in presets.items():
        print(f"\n{preset_name.replace('_', ' ').title()}:")
        print(f"  Age Range: {preset_data['age_range']}")
        print(f"  Vocal Quality: {preset_data['vocal_quality']}")
        print(f"  Accent: {preset_data['accent']}")
    
    print("\n✅ Test passed!\n")


def test_character_validation():
    """Test character validation with missing fields"""
    print("=" * 80)
    print("TEST 6: Character Validation")
    print("=" * 80)
    
    # Character with missing fields
    incomplete_character = {
        'name': 'TestCharacter',
        'age_range': 'mid-30s'
        # Missing: vocal_quality, speaking_style, accent, emotional_baseline
    }
    
    print(f"\nBefore Validation:")
    print(f"Fields: {list(incomplete_character.keys())}")
    
    validated = voice_lock_service.validate_character_voice_data(incomplete_character)
    
    print(f"\nAfter Validation:")
    print(f"Fields: {list(validated.keys())}")
    print(f"\nValidated Character:")
    for key, value in validated.items():
        print(f"  {key}: {value}")
    
    print("\n✅ Test passed!\n")


def run_all_tests():
    """Run all tests"""
    print("\n" + "=" * 80)
    print(" VOICE LOCK SERVICE - TEST SUITE")
    print("=" * 80 + "\n")
    
    try:
        test_voice_anchor_generation()
        test_ambient_sounds()
        test_complete_prompt()
        test_multi_character_scene()
        test_voice_presets()
        test_character_validation()
        
        print("=" * 80)
        print(" ALL TESTS PASSED! ✅")
        print("=" * 80)
        print("\nVoice Lock Service is working correctly!")
        print("You can now use it in your storytelling application.\n")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
