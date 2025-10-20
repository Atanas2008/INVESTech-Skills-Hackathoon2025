#!/usr/bin/env python3
"""
PlantATree Server Test Script
Test the Flask server functionality and API endpoints
"""

import requests
import json
import sys
import time
from datetime import datetime

def test_server_health():
    """Test if the server is running and healthy"""
    print("🔍 Testing server health...")
    
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is healthy!")
            data = response.json()
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Timestamp: {data.get('timestamp', 'unknown')}")
            return True
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on localhost:5000?")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server response timed out")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_api_info():
    """Test the API info endpoint"""
    print("\n🔍 Testing API info endpoint...")
    
    try:
        response = requests.get("http://localhost:5000/api", timeout=5)
        if response.status_code == 200:
            print("✅ API info endpoint working!")
            data = response.json()
            print(f"   API Name: {data.get('name', 'unknown')}")
            print(f"   Version: {data.get('version', 'unknown')}")
            print(f"   Environment: {data.get('environment', 'unknown')}")
            return True
        else:
            print(f"❌ API info endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing API info: {e}")
        return False

def test_main_page():
    """Test the main web page"""
    print("\n🔍 Testing main web page...")
    
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        if response.status_code == 200:
            print("✅ Main page is accessible!")
            print(f"   Page size: {len(response.text)} characters")
            if "PlantATree" in response.text:
                print("   ✓ Contains PlantATree branding")
            return True
        else:
            print(f"❌ Main page returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error accessing main page: {e}")
        return False

def test_v1_endpoints():
    """Test V1 API endpoints"""
    print("\n🔍 Testing V1 API endpoints...")
    
    try:
        response = requests.get("http://localhost:5000/api/v1/", timeout=5)
        if response.status_code == 200:
            print("✅ V1 API endpoint working!")
            data = response.json()
            print(f"   Message: {data.get('message', 'unknown')}")
            return True
        else:
            print(f"❌ V1 API endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing V1 API: {e}")
        return False

def main():
    """Run all server tests"""
    print("="*60)
    print("🌱 PlantATree Server Test Suite")
    print("="*60)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test results tracking
    tests = [
        ("Server Health", test_server_health),
        ("API Info", test_api_info),
        ("Main Page", test_main_page),
        ("V1 Endpoints", test_v1_endpoints)
    ]
    
    passed = 0
    total = len(tests)
    
    # Run all tests
    for test_name, test_func in tests:
        if test_func():
            passed += 1
        time.sleep(0.5)  # Small delay between tests
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! Your PlantATree server is working perfectly!")
        print("\n📍 You can access your application at:")
        print("   🌐 Main App: http://localhost:5000")
        print("   🔧 API Health: http://localhost:5000/api/health")
        print("   📊 API Info: http://localhost:5000/api")
        print("   🚀 V1 API: http://localhost:5000/api/v1/")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check server status and configuration.")
        print("\n💡 Troubleshooting tips:")
        print("   1. Make sure the Flask server is running")
        print("   2. Check that no other process is using port 5000")
        print("   3. Verify all environment variables in .env are set correctly")
        print("   4. Check the server console for error messages")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)