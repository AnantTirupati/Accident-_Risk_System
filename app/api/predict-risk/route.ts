// POST /api/predict-risk - Predict accident risk for a road segment
// Equivalent to FastAPI POST /predict-risk endpoint

import { NextResponse } from "next/server"
import { predictRisk } from "@/lib/ml-model"
import type { PredictionInput } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "road_id",
      "curve_radius",
      "road_slope",
      "num_lanes",
      "speed_limit",
      "junction_density",
      "hour",
      "weather_type",
      "rain_intensity",
      "visibility",
      "temperature",
      "humidity",
      "wind_speed",
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Build prediction input
    const input: PredictionInput = {
      road_id: body.road_id,
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      curve_radius: body.curve_radius,
      road_slope: body.road_slope,
      num_lanes: body.num_lanes,
      speed_limit: body.speed_limit,
      junction_density: body.junction_density,
      hour: body.hour,
      day_type: body.day_type || "weekday",
      weather_type: body.weather_type,
      rain_intensity: body.rain_intensity,
      visibility: body.visibility,
      temperature: body.temperature,
      humidity: body.humidity,
      wind_speed: body.wind_speed,
    }

    // Get prediction from ML model
    const prediction = predictRisk(input)

    return NextResponse.json({
      road_id: prediction.road_id,
      risk_score: prediction.risk_score,
      climate_risk: prediction.climate_risk,
      top_factors: prediction.top_factors,
      recommendations: prediction.recommendations,
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Failed to process prediction request" }, { status: 500 })
  }
}
