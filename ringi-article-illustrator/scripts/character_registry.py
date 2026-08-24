#!/usr/bin/env python3
"""
Ringi Standalone Character Registry CLI
Usage:
    python character_registry.py list
    python character_registry.py get-active
"""

import os
import json

def get_active_character():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(os.path.dirname(script_dir), "assets")
    ringi_dir = os.path.join(assets_dir, "characters", "ringi")
    
    char_json = os.path.join(ringi_dir, "character.json")
    if os.path.exists(char_json):
        with open(char_json, "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"Active Character: {data.get('name', 'Ringi')} ({data.get('slug', 'ringi')})")
            print(f"Spec Path: {os.path.join(ringi_dir, 'character-spec-v3.md')}")
            print(f"Standee: {os.path.join(ringi_dir, 'ringi-tshirt-standee-clearglasses.jpg')}")
            return data
    else:
        print("Defaulting to Ringi v3 (Summer Tee, Olive Green, Clear Glasses)")
        return {"slug": "ringi", "name": "Ringi"}

if __name__ == "__main__":
    get_active_character()
