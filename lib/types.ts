export interface LatLng {
  lat: number
  lng: number
}

export interface RoadGeometry {
  start: LatLng
  end: LatLng
}

export interface RoadSegment {
  road_id: string
  geometry: RoadGeometry   // ✅ REQUIRED
  curve_radius: number
  road_slope: number
  num_lanes: number
  speed_limit: number
  junction_density: number
}

export interface ClimateConditions {
  weather_type: "clear" | "rain" | "fog" | "storm"
  rain_intensity: number
  visibility: number
  temperature: number
  humidity: number
  wind_speed: number
}

export interface TimeConditions {
  hour: number
  day_type: "weekday" | "weekend"
}

export interface PredictionInput
  extends RoadSegment,
    ClimateConditions,
    TimeConditions {}

export interface RiskPrediction {
  road_id: string
  risk_score: number
  climate_risk: "Low" | "Medium" | "High" | "Critical"
  top_factors: string[]
  recommendations: string[]
}

export interface RoadSegmentWithRisk extends RoadSegment {
  risk_score: number
  climate_risk: "Low" | "Medium" | "High" | "Critical"
  top_factors: string[]
}
