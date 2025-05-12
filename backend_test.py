import requests
import sys
import json
from datetime import datetime
import uuid

class TeleWallAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.post_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "api",
            200
        )

    def test_create_user(self):
        """Test user creation"""
        user_data = {
            "telegram_id": f"test_user_{uuid.uuid4()}",
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "name": "Test User",
            "photo_url": "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            "description": "This is a test user for API testing"
        }
        
        success, response = self.run_test(
            "Create User",
            "POST",
            "api/users",
            200,
            data=user_data
        )
        
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"Created user with ID: {self.user_id}")
        
        return success, response

    def test_get_user(self):
        """Test getting user by ID"""
        if not self.user_id:
            print("❌ Cannot test get_user: No user ID available")
            return False, {}
        
        return self.run_test(
            "Get User",
            "GET",
            f"api/users/{self.user_id}",
            200
        )

    def test_create_text_post(self):
        """Test creating a text post"""
        if not self.user_id:
            print("❌ Cannot test create_post: No user ID available")
            return False, {}
        
        post_data = {
            "content": "This is a test text post created by the API tester",
            "type": "text",
            "user_id": self.user_id
        }
        
        success, response = self.run_test(
            "Create Text Post",
            "POST",
            "api/posts",
            200,
            data=post_data
        )
        
        if success and 'id' in response:
            self.post_id = response['id']
            print(f"Created post with ID: {self.post_id}")
        
        return success, response

    def test_create_drawing_post(self):
        """Test creating a drawing post"""
        if not self.user_id:
            print("❌ Cannot test create_drawing_post: No user ID available")
            return False, {}
        
        # Base64 encoded small drawing (just a dot)
        drawing_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        
        post_data = {
            "content": drawing_data,
            "type": "drawing",
            "user_id": self.user_id
        }
        
        return self.run_test(
            "Create Drawing Post",
            "POST",
            "api/posts",
            200,
            data=post_data
        )

    def test_get_posts(self):
        """Test getting all posts"""
        return self.run_test(
            "Get All Posts",
            "GET",
            "api/posts",
            200
        )

    def test_get_user_posts(self):
        """Test getting posts for a specific user"""
        if not self.user_id:
            print("❌ Cannot test get_user_posts: No user ID available")
            return False, {}
        
        return self.run_test(
            "Get User Posts",
            "GET",
            f"api/users/{self.user_id}/posts",
            200
        )

def main():
    # Get the backend URL from the frontend .env file
    backend_url = "https://981e101c-e872-4257-a712-e03c51d76d97.preview.emergentagent.com"
    
    print(f"🚀 Starting TeleWall API Tests against {backend_url}")
    
    # Setup tester
    tester = TeleWallAPITester(backend_url)
    
    # Run tests
    tester.test_api_root()
    tester.test_create_user()
    tester.test_get_user()
    tester.test_create_text_post()
    tester.test_create_drawing_post()
    tester.test_get_posts()
    tester.test_get_user_posts()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())