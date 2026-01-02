import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

print("🔍 Listing all Redis keys and their types:")
try:
    keys = r.keys("*")
    if not keys:
        print("❌ No keys found in Redis.")
    else:
        for key in keys:
            k_name = key.decode('utf-8')
            k_type = r.type(key).decode('utf-8')
            print(f"- {k_name} ({k_type})")
except Exception as e:
    print(f"❌ Error connecting to Redis: {e}")

print("\n--- End of List ---")
