import time
import urllib.request
import json

url = "https://fasalai-backend.onrender.com/train/status"
req = urllib.request.Request(url, headers={"Authorization": "Bearer fasalai-dev-secret-123"})

previous_count = -1
stable_count_iterations = 0

print("Starting to monitor ML training status...")

while True:
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            total = data.get("total_models", 0)
            print(f"Current models trained: {total}")
            
            if total >= 30:
                print("All 30 models successfully trained!")
                break
                
            if total == previous_count and total > 0:
                stable_count_iterations += 1
                if stable_count_iterations >= 3: # 3 minutes without change
                    print(f"Training appears to have stopped/finished. Total models trained: {total}")
                    break
            else:
                stable_count_iterations = 0
                
            previous_count = total
    except Exception as e:
        print(f"Error checking status: {e}")
        
    time.sleep(60) # Wait 1 minute
