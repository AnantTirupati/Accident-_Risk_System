# FastAPI Backend Reference Implementation
# This is the Python equivalent of the Next.js API routes
# To run: pip install fastapi uvicorn joblib pandas numpy scikit-learn
# Then: uvicorn fastapi_backend:app --reload

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
import numpy as np

app = FastAPI(
    title="Accident Risk Prediction API",
    description="Climate-Aware Smart Transportation Risk Assessment",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PredictionInput(BaseModel):
    road_id: str
    curve_radius: float
    road_slope: float
    num_lanes: int
    speed_limit: int
    junction_density: int
    hour: int
    weather_type: Literal["clear", "rain", "fog", "storm"]
    rain_intensity: float
    visibility: int
    temperature: int
    humidity: int
    wind_speed: int
    day_type: Optional[Literal["weekday", "weekend"]] = "weekday"

class RiskPrediction(BaseModel):
    road_id: str
    risk_score: float
    climate_risk: Literal["Low", "Medium", "High", "Critical"]
    top_factors: List[str]
    recommendations: List[str]

# Feature engineering functions
def is_night(hour: int) -> bool:
    return hour >= 20 or hour <= 6

def is_peak_hour(hour: int) -> bool:
    return (hour >= 7 and hour <= 10) or (hour >= 17 and hour <= 20)

def calculate_climate_risk_index(weather_type: str, rain_intensity: float, 
                                   visibility: int, wind_speed: int, humidity: int) -> float:
    index = 0.0
    
    weather_weights = {"clear": 0, "rain": 0.3, "fog": 0.4, "storm": 0.5}
    index += weather_weights.get(weather_type, 0)
    
    index += (rain_intensity / 10) * 0.2
    index += max(0, (500 - visibility) / 500) * 0.15
    index += min(wind_speed / 50, 1) * 0.1
    
    if humidity > 80:
        index += 0.05
    
    return min(index, 1.0)

def predict_risk(input_data: PredictionInput) -> RiskPrediction:
    """Main prediction function simulating ML model output"""
    factors = []
    risk_score = 0.0
    
    # Time-based features
    if is_night(input_data.hour):
        risk_score += 0.15
        factors.append("Night Time")
    if is_peak_hour(input_data.hour):
        risk_score += 0.1
        factors.append("Peak Hour Traffic")
    
    # Road-based features
    if input_data.curve_radius < 50:
        risk_score += 0.2
        factors.append("Sharp Curve")
    if input_data.speed_limit >= 80:
        risk_score += 0.1
        factors.append("High Speed Zone")
    if input_data.road_slope > 8:
        risk_score += 0.1
        factors.append("Steep Slope")
    if input_data.num_lanes <= 2:
        risk_score += 0.05
        factors.append("Narrow Road")
    if input_data.junction_density > 3:
        risk_score += 0.1
        factors.append("High Junction Density")
    
    # Climate-based features
    climate_index = calculate_climate_risk_index(
        input_data.weather_type,
        input_data.rain_intensity,
        input_data.visibility,
        input_data.wind_speed,
        input_data.humidity
    )
    risk_score += climate_index * 0.4
    
    if input_data.weather_type == "rain":
        factors.append("Heavy Rain")
    elif input_data.weather_type == "fog":
        factors.append("Dense Fog")
    elif input_data.weather_type == "storm":
        factors.append("Storm Conditions")
    
    if input_data.visibility < 200:
        factors.append("Low Visibility")
    if input_data.rain_intensity > 2:
        factors.append("Wet Road Surface")
    if input_data.temperature < 5 or input_data.temperature > 40:
        factors.append("Extreme Temperature")
    if input_data.wind_speed > 30:
        factors.append("High Wind Risk")
    
    # Normalize risk score
    risk_score = max(0, min(risk_score, 1))
    
    # Determine risk level
    if risk_score >= 0.75:
        climate_risk = "Critical"
    elif risk_score >= 0.5:
        climate_risk = "High"
    elif risk_score >= 0.25:
        climate_risk = "Medium"
    else:
        climate_risk = "Low"
    
    # Generate recommendations
    recommendations = []
    if "Heavy Rain" in factors or "Wet Road Surface" in factors:
        recommendations.append("Reduce speed by 20% due to wet conditions")
    if "Low Visibility" in factors or "Dense Fog" in factors:
        recommendations.append("Use fog lights and maintain safe distance")
    if "Sharp Curve" in factors:
        recommendations.append("Approach curves at reduced speed")
    if "Night Time" in factors:
        recommendations.append("Ensure proper headlight usage")
    if "High Wind Risk" in factors:
        recommendations.append("Two-wheelers and tall vehicles use caution")
    if risk_score >= 0.75:
        recommendations.append("Consider alternate route if possible")
    
    return RiskPrediction(
        road_id=input_data.road_id,
        risk_score=round(risk_score, 2),
        climate_risk=climate_risk,
        top_factors=factors[:5],
        recommendations=recommendations[:4]
    )

# API Endpoints
@app.post("/predict-risk", response_model=RiskPrediction)
async def api_predict_risk(input_data: PredictionInput):
    """
    Predict accident risk for a road segment based on road geometry, 
    time, and climate conditions.
    """
    try:
        return predict_risk(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/road-segments")
async def get_road_segments(
    weather_type: str = "clear",
    rain_intensity: float = 0,
    visibility: int = 1000,
    temperature: int = 25,
    humidity: int = 60,
    wind_speed: int = 10,
    hour: int = 12
):
    """
    Get all road segments with their current risk scores based on climate conditions.
    """
    # Sample road data
    roads = [
        {"road_id": "NH48_101", "lat": 12.9716, "lng": 77.5946, "curve": 35, "slope": 12, "lanes": 2, "speed": 80, "junctions": 4},
        {"road_id": "NH48_102", "lat": 12.9656, "lng": 77.6046, "curve": 120, "slope": 3, "lanes": 4, "speed": 60, "junctions": 2},
        {"road_id": "NH48_103", "lat": 12.9786, "lng": 77.5846, "curve": 25, "slope": 15, "lanes": 2, "speed": 100, "junctions": 5},
        {"road_id": "MG_ROAD_01", "lat": 12.9756, "lng": 77.6106, "curve": 200, "slope": 2, "lanes": 6, "speed": 50, "junctions": 6},
        {"road_id": "OUTER_RING_01", "lat": 12.9516, "lng": 77.6446, "curve": 80, "slope": 5, "lanes": 4, "speed": 80, "junctions": 3},
    ]
    
    segments = []
    for road in roads:
        input_data = PredictionInput(
            road_id=road["road_id"],
            curve_radius=road["curve"],
            road_slope=road["slope"],
            num_lanes=road["lanes"],
            speed_limit=road["speed"],
            junction_density=road["junctions"],
            hour=hour,
            weather_type=weather_type,
            rain_intensity=rain_intensity,
            visibility=visibility,
            temperature=temperature,
            humidity=humidity,
            wind_speed=wind_speed
        )
        prediction = predict_risk(input_data)
        
        segments.append({
            "road_id": road["road_id"],
            "coordinates": {"latitude": road["lat"], "longitude": road["lng"]},
            "risk_assessment": {
                "risk_score": prediction.risk_score,
                "climate_risk": prediction.climate_risk,
                "top_factors": prediction.top_factors
            }
        })
    
    return {
        "total": len(segments),
        "climate_conditions": {
            "weather_type": weather_type,
            "rain_intensity": rain_intensity,
            "visibility": visibility
        },
        "segments": segments
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": "loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
