// Simulated ML Model for accident risk prediction
// In production, this would call a Python FastAPI backend with a trained model

import type { PredictionInput, RiskPrediction } from "./types"

// Feature engineering functions
function isNight(hour: number): boolean {
  return hour >= 20 || hour <= 6
}

function isPeakHour(hour: number): boolean {
  return (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)
}

function isSharpCurve(curveRadius: number): boolean {
  return curveRadius < 50
}

function isHighSpeedZone(speedLimit: number): boolean {
  return speedLimit >= 80
}

function isSteepSlope(roadSlope: number): boolean {
  return roadSlope > 8
}

function isPoorVisibility(visibility: number): boolean {
  return visibility < 200
}

function isWetRoad(rainIntensity: number): boolean {
  return rainIntensity > 2
}

function isExtremeTemperature(temperature: number): boolean {
  return temperature < 5 || temperature > 40
}

function isHighWindRisk(windSpeed: number): boolean {
  return windSpeed > 30
}

// Calculate climate risk index (0-1)
function calculateClimateRiskIndex(input: PredictionInput): number {
  let index = 0

  // Weather type contribution
  const weatherWeights: Record<string, number> = {
    clear: 0,
    rain: 0.3,
    fog: 0.4,
    storm: 0.5,
  }
  index += weatherWeights[input.weather_type] || 0

  // Rain intensity (0-10 scale)
  index += (input.rain_intensity / 10) * 0.2

  // Visibility impact (inverted, lower = higher risk)
  index += Math.max(0, (500 - input.visibility) / 500) * 0.15

  // Wind speed impact
  index += Math.min(input.wind_speed / 50, 1) * 0.1

  // Humidity impact on braking
  if (input.humidity > 80) {
    index += 0.05
  }

  return Math.min(index, 1)
}

// Main prediction function (simulates ML model output)
export function predictRisk(input: PredictionInput): RiskPrediction {
  const factors: string[] = []
  let riskScore = 0

  // Time-based features
  if (isNight(input.hour)) {
    riskScore += 0.15
    factors.push("Night Time")
  }
  if (isPeakHour(input.hour)) {
    riskScore += 0.1
    factors.push("Peak Hour Traffic")
  }

  // Road-based features
  if (isSharpCurve(input.curve_radius)) {
    riskScore += 0.2
    factors.push("Sharp Curve")
  }
  if (isHighSpeedZone(input.speed_limit)) {
    riskScore += 0.1
    factors.push("High Speed Zone")
  }
  if (isSteepSlope(input.road_slope)) {
    riskScore += 0.1
    factors.push("Steep Slope")
  }
  if (input.num_lanes <= 2) {
    riskScore += 0.05
    factors.push("Narrow Road")
  }
  if (input.junction_density > 3) {
    riskScore += 0.1
    factors.push("High Junction Density")
  }

  // Climate-based features
  const climateIndex = calculateClimateRiskIndex(input)
  riskScore += climateIndex * 0.4

  if (input.weather_type === "rain") {
    factors.push("Heavy Rain")
  } else if (input.weather_type === "fog") {
    factors.push("Dense Fog")
  } else if (input.weather_type === "storm") {
    factors.push("Storm Conditions")
  }

  if (isPoorVisibility(input.visibility)) {
    factors.push("Low Visibility")
  }
  if (isWetRoad(input.rain_intensity)) {
    factors.push("Wet Road Surface")
  }
  if (isExtremeTemperature(input.temperature)) {
    factors.push("Extreme Temperature")
  }
  if (isHighWindRisk(input.wind_speed)) {
    factors.push("High Wind Risk")
  }

  // Normalize risk score
  riskScore = Math.min(Math.max(riskScore, 0), 1)

  // Determine climate risk level
  let climateRisk: RiskPrediction["climate_risk"]
  if (riskScore >= 0.75) {
    climateRisk = "Critical"
  } else if (riskScore >= 0.5) {
    climateRisk = "High"
  } else if (riskScore >= 0.25) {
    climateRisk = "Medium"
  } else {
    climateRisk = "Low"
  }

  // Generate recommendations
  const recommendations = generateRecommendations(factors, riskScore)

  return {
    road_id: input.road_id,
    risk_score: Math.round(riskScore * 100) / 100,
    climate_risk: climateRisk,
    top_factors: factors.slice(0, 5),
    recommendations,
  }
}

function generateRecommendations(factors: string[], riskScore: number): string[] {
  const recommendations: string[] = []

  if (factors.includes("Heavy Rain") || factors.includes("Wet Road Surface")) {
    recommendations.push("Reduce speed by 20% due to wet conditions")
  }
  if (factors.includes("Low Visibility") || factors.includes("Dense Fog")) {
    recommendations.push("Use fog lights and maintain safe distance")
  }
  if (factors.includes("Sharp Curve")) {
    recommendations.push("Approach curves at reduced speed")
  }
  if (factors.includes("Night Time")) {
    recommendations.push("Ensure proper headlight usage")
  }
  if (factors.includes("High Wind Risk")) {
    recommendations.push("Two-wheelers and high-profile vehicles use caution")
  }
  if (riskScore >= 0.75) {
    recommendations.push("Consider alternate route if possible")
  }

  return recommendations.slice(0, 4)
}

// Get risk color based on score and weather
export function getRiskColor(riskScore: number, weatherType: string): string {
  if (riskScore >= 0.75) {
    return weatherType === "rain" ? "#dc2626" : "#ef4444" // Dark red for rain + high risk
  } else if (riskScore >= 0.5) {
    return weatherType === "fog" ? "#f97316" : "#fb923c" // Orange for fog + medium risk
  } else if (riskScore >= 0.25) {
    return "#fbbf24" // Yellow for low-medium
  }
  return "#22c55e" // Green for safe
}
