import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import sys

# Load environment variables
load_dotenv()

def setup_mongodb():
    print("="*50)
    print("🚀 MONGODB ATLAS CONNECTION TEST & SETUP")
    print("="*50)

    # 1. Check for URI
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("❌ Error: MONGODB_URI not found in .env file.")
        return False

    try:
        # 2. Connect
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
        
        # 3. Ping
        client.admin.command('ping')
        print("✅ Connection Successful!")
        
        # 4. Access Database
        db_name = 'veo_prompt_generator'
        db = client[db_name]
        print(f"✅ Accessed Database: {db_name}")

        # 5. Initialize Collection
        collection_name = 'user_data'
        if collection_name not in db.list_collection_names():
            print(f"ℹ️ Collection '{collection_name}' does not exist. Creating it with initial state...")
            
            # Create the initial global state
            initial_state = {
                "_id": "global_state",
                "enabled": True,
                "setting": "",
                "lighting": "",
                "timeOfDay": "",
                "characters": {}
            }
            db[collection_name].insert_one(initial_state)
            print(f"✅ Created '{collection_name}' collection with default state.")
        else:
            print(f"ℹ️ Collection '{collection_name}' already exists.")
            count = db[collection_name].count_documents({})
            print(f"   - Documents found: {count}")

        print("\n🎉 SYSTEM READY FOR MONGODB ATLAS")
        return True

    except Exception as e:
        print(f"\n❌ CONNECTION FAILED: {str(e)}")
        print("\nTroubleshooting Tips:")
        print("1. Check if your IP address is whitelisted in MongoDB Atlas.")
        print("2. Verify the username and password in the connection string.")
        print("3. Ensure your firewall isn't blocking port 27017.")
        return False

if __name__ == "__main__":
    success = setup_mongodb()
    if not success:
        sys.exit(1)
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import sys

# Load environment variables
load_dotenv()

def setup_mongodb():
    print("="*50)
    print("🚀 MONGODB ATLAS CONNECTION TEST & SETUP")
    print("="*50)

    # 1. Check for URI
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("❌ Error: MONGODB_URI not found in .env file.")
        return False

    try:
        # 2. Connect
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
        
        # 3. Ping
        client.admin.command('ping')
        print("✅ Connection Successful!")
        
        # 4. Access Database
        db_name = 'veo_prompt_generator'
        db = client[db_name]
        print(f"✅ Accessed Database: {db_name}")

        # 5. Initialize Collection
        collection_name = 'user_data'
        if collection_name not in db.list_collection_names():
            print(f"ℹ️ Collection '{collection_name}' does not exist. Creating it with initial state...")
            
            # Create the initial global state
            initial_state = {
                "_id": "global_state",
                "enabled": True,
                "setting": "",
                "lighting": "",
                "timeOfDay": "",
                "characters": {}
            }
            db[collection_name].insert_one(initial_state)
            print(f"✅ Created '{collection_name}' collection with default state.")
        else:
            print(f"ℹ️ Collection '{collection_name}' already exists.")
            count = db[collection_name].count_documents({})
            print(f"   - Documents found: {count}")

        print("\n🎉 SYSTEM READY FOR MONGODB ATLAS")
        return True

    except Exception as e:
        print(f"\n❌ CONNECTION FAILED: {str(e)}")
        print("\nTroubleshooting Tips:")
        print("1. Check if your IP address is whitelisted in MongoDB Atlas.")
        print("2. Verify the username and password in the connection string.")
        print("3. Ensure your firewall isn't blocking port 27017.")
        return False

if __name__ == "__main__":
    success = setup_mongodb()
    if not success:
        sys.exit(1)
