// GET /api/road-segments
// Returns road segments with ML-based risk scores
// Geometry-based (Polyline ready)

import { NextResponse } from "next/server"
import { getRoadSegmentsWithRisk } from "@/lib/road-data"
import type { ClimateConditions } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // ---- Climate parameters ----
    const weatherType =
      (searchParams.get(
        "weather_type"
      ) as ClimateConditions["weather_type"]) || "clear"

    const rainIntensity = Number.parseFloat(
      searchParams.get("rain_intensity") || "0"
    )
    const visibility = Number.parseInt(
      searchParams.get("visibility") || "1000"
    )
    const temperature = Number.parseInt(
      searchParams.get("temperature") || "25"
    )
    const humidity = Number.parseInt(
      searchParams.get("humidity") || "60"
    )
    const windSpeed = Number.parseInt(
      searchParams.get("wind_speed") || "10"
    )
    const hour = Number.parseInt(searchParams.get("hour") || "12")

    const climate: ClimateConditions = {
      weather_type: weatherType,
      rain_intensity: rainIntensity,
      visibility,
      temperature,
      humidity,
      wind_speed: windSpeed,
    }

    // ---- ML risk calculation ----
    const segments = getRoadSegmentsWithRisk(climate, hour)

    // ---- API response (geometry-based) ----
    return NextResponse.json({
      total: segments.length,
      climate_conditions: climate,
      hour,
      segments: segments.map((seg) => ({
        road_id: seg.road_id,

        geometry: {
          start: {
            lat: seg.geometry.start.lat,
            lng: seg.geometry.start.lng,
          },
          end: {
            lat: seg.geometry.end.lat,
            lng: seg.geometry.end.lng,
          },
        },

        road_properties: {
          curve_radius: seg.curve_radius,
          road_slope: seg.road_slope,
          num_lanes: seg.num_lanes,
          speed_limit: seg.speed_limit,
          junction_density: seg.junction_density,
        },

        risk_assessment: {
          risk_score: seg.risk_score,
          climate_risk: seg.climate_risk,
          top_factors: seg.top_factors,
        },
      })),
    })
  } catch (error) {
    console.error("Road segments API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch road segments" },
      { status: 500 }
    )
  }
}
