// Sample road segment data for the demo
// In production, this would come from a database

import type { RoadSegment, ClimateConditions, RoadSegmentWithRisk } from "./types"
import { predictRisk } from "./ml-model"

export const sampleRoadSegments: RoadSegment[] = [
  {
    road_id: "NH48_101",
    latitude: 12.9716,
    longitude: 77.5946,
    curve_radius: 35,
    road_slope: 12,
    num_lanes: 2,
    speed_limit: 80,
    junction_density: 4,
  },
  {
    road_id: "NH48_102",
    latitude: 12.9656,
    longitude: 77.6046,
    curve_radius: 120,
    road_slope: 3,
    num_lanes: 4,
    speed_limit: 60,
    junction_density: 2,
  },
  {
    road_id: "NH48_103",
    latitude: 12.9786,
    longitude: 77.5846,
    curve_radius: 25,
    road_slope: 15,
    num_lanes: 2,
    speed_limit: 100,
    junction_density: 5,
  },
  {
    road_id: "MG_ROAD_01",
    latitude: 12.9756,
    longitude: 77.6106,
    curve_radius: 200,
    road_slope: 2,
    num_lanes: 6,
    speed_limit: 50,
    junction_density: 6,
  },
  {
    road_id: "OUTER_RING_01",
    latitude: 12.9516,
    longitude: 77.6446,
    curve_radius: 80,
    road_slope: 5,
    num_lanes: 4,
    speed_limit: 80,
    junction_density: 3,
  },
  {
    road_id: "OUTER_RING_02",
    latitude: 12.9616,
    longitude: 77.6346,
    curve_radius: 45,
    road_slope: 8,
    num_lanes: 4,
    speed_limit: 70,
    junction_density: 4,
  },
  {
    road_id: "SARJAPUR_01",
    latitude: 12.9116,
    longitude: 77.6846,
    curve_radius: 60,
    road_slope: 6,
    num_lanes: 2,
    speed_limit: 60,
    junction_density: 5,
  },
  {
    road_id: "WHITEFIELD_01",
    latitude: 12.9696,
    longitude: 77.7496,
    curve_radius: 100,
    road_slope: 4,
    num_lanes: 4,
    speed_limit: 60,
    junction_density: 3,
  },
  {
    road_id: "ELECTRONIC_CITY_01",
    latitude: 12.8396,
    longitude: 77.6776,
    curve_radius: 150,
    road_slope: 2,
    num_lanes: 6,
    speed_limit: 80,
    junction_density: 2,
  },
  {
    road_id: "HEBBAL_FLY_01",
    latitude: 13.0356,
    longitude: 77.5946,
    curve_radius: 40,
    road_slope: 10,
    num_lanes: 4,
    speed_limit: 60,
    junction_density: 4,
  },
]

export function getRoadSegmentsWithRisk(
  climate: ClimateConditions,
  hour: number,
  dayType: "weekday" | "weekend" = "weekday",
): RoadSegmentWithRisk[] {
  return sampleRoadSegments.map((segment) => {
    const prediction = predictRisk({
      ...segment,
      ...climate,
      hour,
      day_type: dayType,
    })

    return {
      ...segment,
      risk_score: prediction.risk_score,
      climate_risk: prediction.climate_risk,
      top_factors: prediction.top_factors,
    }
  })
}
