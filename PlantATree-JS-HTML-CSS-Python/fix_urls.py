#!/usr/bin/env python3
"""
Fix corrupted URLs in script.js file
The comment removal script was too aggressive and removed parts of URLs
"""
import re

def fix_corrupted_urls(content):
    """Fix all corrupted URLs in the content"""
    
    # Fix API URLs
    content = re.sub(r"const API_BASE_URL = 'https:.*?';", 
                    "const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';", content, flags=re.DOTALL)
    
    content = re.sub(r"const AMBEE_BASE_URL = 'https:.*?';", 
                    "const AMBEE_BASE_URL = 'https://api.ambeedata.com';", content, flags=re.DOTALL)
    
    # Fix map tile layer URLs
    content = re.sub(r"L\.tileLayer\(`https:.*?`", 
                    "L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${API_KEY}`", content)
    
    # Fix placeholder image URLs
    content = re.sub(r"'https:[^']*placeholder[^']*'", 
                    "'https://via.placeholder.com/400x200/f0f8f4/7bc142?text=Еко+Действие'", content)
    
    content = re.sub(r'"https:[^"]*placeholder[^"]*"', 
                    '"https://via.placeholder.com/400x200/f0f8f4/7bc142?text=Еко+Действие"', content)
    
    # Fix ui-avatars URLs
    content = re.sub(r"'https:[^']*ui-avatars[^']*'", 
                    "'https://ui-avatars.com/api/?name=U&background=7bc142&color=ffffff&size=100'", content)
    
    content = re.sub(r'"https:[^"]*ui-avatars[^"]*"', 
                    '"https://ui-avatars.com/api/?name=U&background=7bc142&color=ffffff&size=100"', content)
    
    # Fix generic https: followed by broken strings
    content = re.sub(r"'https:\s*\n", "'https://via.placeholder.com/100'\n", content)
    content = re.sub(r'"https:\s*\n', '"https://via.placeholder.com/100"\n', content)
    
    # Fix broken template literals
    content = re.sub(r"`https:\s*\n", "`https://via.placeholder.com/100`\n", content)
    
    # Fix any remaining standalone 'https:' 
    content = re.sub(r"'https:'\s*[,;]", "'https://via.placeholder.com/100',", content)
    content = re.sub(r'"https:"\s*[,;]', '"https://via.placeholder.com/100",', content)
    
    return content

def fix_script_js():
    """Fix the corrupted script.js file"""
    
    try:
        with open('script.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("Fixing corrupted URLs in script.js...")
        
        # Fix the URLs
        fixed_content = fix_corrupted_urls(content)
        
        # Write back to file
        with open('script.js', 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print("✅ script.js URLs fixed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing script.js: {e}")

if __name__ == '__main__':
    fix_script_js()