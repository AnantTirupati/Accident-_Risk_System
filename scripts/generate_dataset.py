# Script to generate sample dataset for ML model training
# Run this to create a synthetic dataset with climate features

import csv
import random
from datetime import datetime, timedelta

# Configuration
NUM_SAMPLES = 1000
OUTPUT_FILE = "accident_dataset.csv"

# Road segments
ROAD_IDS = [
    "NH48_101", "NH48_102", "NH48_103", "MG_ROAD_01", 
    "OUTER_RING_01", "OUTER_RING_02", "SARJAPUR_01",
    "WHITEFIELD_01", "ELECTRONIC_CITY_01", "HEBBAL_FLY_01"
]

# Weather types
WEATHER_TYPES = ["clear", "rain", "fog", "storm"]

def generate_sample():
    road_id = random.choice(ROAD_IDS)
    
    # Road characteristics based on road_id
    road_configs = {
        "NH48_101": {"lat": 12.9716, "lng": 77.5946, "curve": 35, "slope": 12, "lanes": 2, "speed": 80, "junctions": 4},
        "NH48_102": {"lat": 12.9656, "lng": 77.6046, "curve": 120, "slope": 3, "lanes": 4, "speed": 60, "junctions": 2},
        "NH48_103": {"lat": 12.9786, "lng": 77.5846, "curve": 25, "slope": 15, "lanes": 2, "speed": 100, "junctions": 5},
        "MG_ROAD_01": {"lat": 12.9756, "lng": 77.6106, "curve": 200, "slope": 2, "lanes": 6, "speed": 50, "junctions": 6},
        "OUTER_RING_01": {"lat": 12.9516, "lng": 77.6446, "curve": 80, "slope": 5, "lanes": 4, "speed": 80, "junctions": 3},
        "OUTER_RING_02": {"lat": 12.9616, "lng": 77.6346, "curve": 45, "slope": 8, "lanes": 4, "speed": 70, "junctions": 4},
        "SARJAPUR_01": {"lat": 12.9116, "lng": 77.6846, "curve": 60, "slope": 6, "lanes": 2, "speed": 60, "junctions": 5},
        "WHITEFIELD_01": {"lat": 12.9696, "lng": 77.7496, "curve": 100, "slope": 4, "lanes": 4, "speed": 60, "junctions": 3},
        "ELECTRONIC_CITY_01": {"lat": 12.8396, "lng": 77.6776, "curve": 150, "slope": 2, "lanes": 6, "speed": 80, "junctions": 2},
        "HEBBAL_FLY_01": {"lat": 13.0356, "lng": 77.5946, "curve": 40, "slope": 10, "lanes": 4, "speed": 60, "junctions": 4}
    }
    
    config = road_configs[road_id]
    
    # Time features
    hour = random.randint(0, 23)
    day_type = random.choice(["weekday", "weekend"])
    
    # Weather features
    weather_type = random.choices(WEATHER_TYPES, weights=[0.5, 0.25, 0.15, 0.1])[0]
    
    if weather_type == "clear":
        rain_intensity = 0
        visibility = random.randint(800, 1000)
    elif weather_type == "rain":
        rain_intensity = random.uniform(2, 10)
        visibility = random.randint(100, 400)
    elif weather_type == "fog":
        rain_intensity = 0
        visibility = random.randint(50, 200)
    else:  # storm
        rain_intensity = random.uniform(5, 10)
        visibility = random.randint(100, 300)
    
    temperature = random.randint(5, 45)
    humidity = random.randint(30, 95)
    wind_speed = random.randint(0, 60)
    
    # Calculate accident severity based on features (0-5 scale)
    severity = 0
    
    # Road factors
    if config["curve"] < 50:
        severity += 1
    if config["slope"] > 8:
        severity += 0.5
    if config["speed"] >= 80:
        severity += 0.5
    if config["junctions"] > 3:
        severity += 0.5
    
    # Time factors
    if hour >= 20 or hour <= 6:
        severity += 0.5
    if (hour >= 7 and hour <= 10) or (hour >= 17 and hour <= 20):
        severity += 0.3
    
    # Weather factors
    if weather_type == "rain":
        severity += 1
    elif weather_type == "fog":
        severity += 1.2
    elif weather_type == "storm":
        severity += 1.5
    
    if visibility < 200:
        severity += 0.5
    if rain_intensity > 5:
        severity += 0.5
    if wind_speed > 40:
        severity += 0.3
    if temperature < 5 or temperature > 40:
        severity += 0.3
    
    # Add some randomness
    severity += random.uniform(-0.5, 0.5)
    severity = max(0, min(5, severity))
    
    return {
        "road_id": road_id,
        "latitude": config["lat"],
        "longitude": config["lng"],
        "curve_radius": config["curve"],
        "road_slope": config["slope"],
        "num_lanes": config["lanes"],
        "speed_limit": config["speed"],
        "junction_density": config["junctions"],
        "hour": hour,
        "day_type": day_type,
        "weather_type": weather_type,
        "rain_intensity": round(rain_intensity, 2),
        "visibility": visibility,
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "accident_severity": round(severity, 2)
    }

# Generate dataset
print(f"Generating {NUM_SAMPLES} samples...")
samples = [generate_sample() for _ in range(NUM_SAMPLES)]

# Write to CSV
fieldnames = [
    "road_id", "latitude", "longitude", "curve_radius", "road_slope",
    "num_lanes", "speed_limit", "junction_density", "hour", "day_type",
    "weather_type", "rain_intensity", "visibility", "temperature",
    "humidity", "wind_speed", "accident_severity"
]

with open(OUTPUT_FILE, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(samples)

print(f"Dataset saved to {OUTPUT_FILE}")
print(f"\nDataset Statistics:")
print(f"- Total samples: {len(samples)}")
print(f"- Weather distribution:")
for w in WEATHER_TYPES:
    count = sum(1 for s in samples if s["weather_type"] == w)
    print(f"  - {w}: {count} ({count/len(samples)*100:.1f}%)")

avg_severity = sum(s["accident_severity"] for s in samples) / len(samples)
print(f"- Average accident severity: {avg_severity:.2f}")
