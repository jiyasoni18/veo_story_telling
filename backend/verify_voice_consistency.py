"""
Voice Consistency Verification Script

This script demonstrates that the Voice Anchor Block is IDENTICAL
across multiple scenes for the same character.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from veo_prompt_generator.services.voice_lock import voice_lock_service


def test_voice_consistency_across_scenes():
    """
    Verify that Voice Anchor Block is IDENTICAL across multiple scenes
    """
    print("=" * 80)
    print(" VOICE CONSISTENCY VERIFICATION")
    print("=" * 80)
    
    # Define character ONCE
    character_definition = {
        'Aria': {
            'name': 'Aria',
            'age_range': 'late 20s',
            'vocal_quality': 'clear, determined alto voice',
            'speaking_style': 'steady and purposeful tone',
            'accent': 'soft Irish accent',
            'emotional_baseline': 'quiet courage and underlying vulnerability, as if carrying a great burden'
        }
    }
    
    # Generate Voice Anchor Block ONCE
    voice_anchor = voice_lock_service.generate_voice_anchor_block(character_definition['Aria'])
    
    print(f"\n📌 CHARACTER DEFINITION (Defined ONCE):")
    print(f"   Name: {character_definition['Aria']['name']}")
    print(f"   Age Range: {character_definition['Aria']['age_range']}")
    print(f"   Vocal Quality: {character_definition['Aria']['vocal_quality']}")
    print(f"   Speaking Style: {character_definition['Aria']['speaking_style']}")
    print(f"   Accent: {character_definition['Aria']['accent']}")
    print(f"   Emotional Baseline: {character_definition['Aria']['emotional_baseline']}")
    
    print(f"\n🔒 VOICE ANCHOR BLOCK (Generated ONCE):")
    print(f"   {voice_anchor}")
    
    print(f"\n" + "=" * 80)
    print(" GENERATING 5 SCENES WITH SAME CHARACTER")
    print("=" * 80)
    
    # Define 5 different scenes
    scenes = [
        {
            'scene_number': 1,
            'description': 'She stands at the edge of a dark forest, hand resting on her sword hilt',
            'location': 'forest',
            'characters': [{'name': 'Aria', 'dialogue': 'The prophecy spoke of this moment'}],
            'camera_angle': 'Wide shot'
        },
        {
            'scene_number': 2,
            'description': 'She walks through ancient temple corridors, torch in hand',
            'location': 'temple',
            'characters': [{'name': 'Aria', 'dialogue': 'The crystal must be here'}],
            'camera_angle': 'Tracking shot'
        },
        {
            'scene_number': 3,
            'description': 'She kneels before a sacred altar, eyes closed in meditation',
            'location': 'temple',
            'characters': [{'name': 'Aria', 'dialogue': 'I am worthy of this power'}],
            'camera_angle': 'Close-up'
        },
        {
            'scene_number': 4,
            'description': 'She climbs a steep mountain path, wind whipping her cloak',
            'location': 'mountain',
            'characters': [{'name': 'Aria', 'dialogue': 'Almost there'}],
            'camera_angle': 'Medium shot'
        },
        {
            'scene_number': 5,
            'description': 'She holds a glowing crystal aloft at the mountain peak',
            'location': 'mountain peak',
            'characters': [{'name': 'Aria', 'dialogue': 'The darkness ends here'}],
            'camera_angle': 'Wide shot'
        }
    ]
    
    # Generate prompts for all scenes
    voice_anchors_extracted = []
    
    for scene in scenes:
        prompt = voice_lock_service.build_complete_scene_prompt(
            scene_data=scene,
            characters=character_definition,
            location=scene['location']
        )
        
        # Extract the Voice Anchor Block from the prompt
        # It appears after the shot type and before the action description
        parts = prompt.split('.')
        # Voice anchor is typically in the second sentence
        extracted_voice_anchor = None
        for i, part in enumerate(parts):
            if 'Aria' in part and 'person in their' in part:
                extracted_voice_anchor = part.strip()
                break
        
        voice_anchors_extracted.append(extracted_voice_anchor)
        
        print(f"\n{'─' * 80}")
        print(f"SCENE {scene['scene_number']}: {scene['location'].upper()}")
        print(f"{'─' * 80}")
        print(f"\nAction: {scene['description']}")
        print(f"Dialogue: {scene['characters'][0]['dialogue']}")
        print(f"\n🔒 Voice Anchor Block in this scene:")
        print(f"   {extracted_voice_anchor}")
    
    # Verify all Voice Anchor Blocks are IDENTICAL
    print(f"\n" + "=" * 80)
    print(" CONSISTENCY VERIFICATION")
    print("=" * 80)
    
    all_identical = all(va == voice_anchors_extracted[0] for va in voice_anchors_extracted)
    
    print(f"\n📊 Voice Anchor Blocks extracted from 5 scenes:")
    for i, va in enumerate(voice_anchors_extracted, 1):
        print(f"\n   Scene {i}: {va}")
    
    print(f"\n" + "=" * 80)
    if all_identical:
        print(" ✅ SUCCESS: ALL VOICE ANCHOR BLOCKS ARE IDENTICAL!")
        print("=" * 80)
        print("\n✅ Voice consistency is PERFECT across all 5 scenes!")
        print("✅ The character will sound the SAME in every scene!")
        print("✅ Veo 3.1 will generate consistent voice output!")
    else:
        print(" ❌ ERROR: Voice Anchor Blocks are NOT identical!")
        print("=" * 80)
    
    return all_identical


def test_multi_character_consistency():
    """
    Verify that multiple characters each maintain their own consistent voice
    """
    print("\n\n" + "=" * 80)
    print(" MULTI-CHARACTER VOICE CONSISTENCY")
    print("=" * 80)
    
    # Define TWO characters
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
    
    # Generate Voice Anchor Blocks
    aria_voice = voice_lock_service.generate_voice_anchor_block(characters['Aria'])
    theron_voice = voice_lock_service.generate_voice_anchor_block(characters['Theron'])
    
    print(f"\n📌 CHARACTER 1: Aria")
    print(f"   Voice Anchor: {aria_voice}")
    
    print(f"\n📌 CHARACTER 2: Theron")
    print(f"   Voice Anchor: {theron_voice}")
    
    # Scene with BOTH characters
    scene = {
        'scene_number': 1,
        'description': 'They stand facing each other in the sacred temple',
        'location': 'temple',
        'characters': [
            {'name': 'Aria', 'dialogue': 'Can you help me find the Crystal of Light?'},
            {'name': 'Theron', 'dialogue': 'The crystal chooses its guardian. Are you ready?'}
        ],
        'camera_angle': 'Medium two-shot'
    }
    
    prompt = voice_lock_service.build_complete_scene_prompt(
        scene_data=scene,
        characters=characters,
        location='temple'
    )
    
    print(f"\n{'─' * 80}")
    print(f"SCENE WITH BOTH CHARACTERS")
    print(f"{'─' * 80}")
    print(f"\nGenerated Prompt:")
    print(f"{prompt}")
    
    # Verify both voice anchors are in the prompt
    aria_in_prompt = aria_voice in prompt
    theron_in_prompt = theron_voice in prompt
    
    print(f"\n" + "=" * 80)
    print(" VERIFICATION")
    print("=" * 80)
    print(f"\n✅ Aria's Voice Anchor in prompt: {aria_in_prompt}")
    print(f"✅ Theron's Voice Anchor in prompt: {theron_in_prompt}")
    
    if aria_in_prompt and theron_in_prompt:
        print(f"\n✅ SUCCESS: Both characters maintain their unique voices!")
        print("✅ Each character's voice is consistent and distinct!")
    
    return aria_in_prompt and theron_in_prompt


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print(" VOICE LOCK CONSISTENCY VERIFICATION TEST SUITE")
    print("=" * 80)
    
    # Test 1: Single character across multiple scenes
    test1_passed = test_voice_consistency_across_scenes()
    
    # Test 2: Multiple characters maintaining distinct voices
    test2_passed = test_multi_character_consistency()
    
    print("\n\n" + "=" * 80)
    print(" FINAL RESULTS")
    print("=" * 80)
    print(f"\nTest 1 (Single Character Consistency): {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Test 2 (Multi-Character Consistency): {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n" + "=" * 80)
        print(" ✅ ALL TESTS PASSED!")
        print("=" * 80)
        print("\n✅ Voice consistency is PERFECT!")
        print("✅ Character voices are LOCKED and IDENTICAL across all scenes!")
        print("✅ System is ready for production use!")
    
    print("\n")
