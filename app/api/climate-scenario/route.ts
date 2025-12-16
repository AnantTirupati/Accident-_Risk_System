// POST /api/climate-scenario - Simulate climate scenario impact
// Extra feature for climate scenario simulation

import { NextResponse } from "next/server"
import { getRoadSegmentsWithRisk } from "@/lib/road-data"
import type { ClimateConditions } from "@/lib/types"

interface ScenarioRequest {
  base_climate: ClimateConditions
  scenario_climate: ClimateConditions
  hour: number
}

export async function POST(request: Request) {
  try {
    const body: ScenarioRequest = await request.json()

    // Get risk for base conditions
    const baseSegments = getRoadSegmentsWithRisk(body.base_climate, body.hour)
    const baseAvgRisk = baseSegments.reduce((sum, s) => sum + s.risk_score, 0) / baseSegments.length
    const baseCritical = baseSegments.filter((s) => s.climate_risk === "Critical").length
    const baseHigh = baseSegments.filter((s) => s.climate_risk === "High").length

    // Get risk for scenario conditions
    const scenarioSegments = getRoadSegmentsWithRisk(body.scenario_climate, body.hour)
    const scenarioAvgRisk = scenarioSegments.reduce((sum, s) => sum + s.risk_score, 0) / scenarioSegments.length
    const scenarioCritical = scenarioSegments.filter((s) => s.climate_risk === "Critical").length
    const scenarioHigh = scenarioSegments.filter((s) => s.climate_risk === "High").length

    // Calculate impact
    const riskChange = ((scenarioAvgRisk - baseAvgRisk) / baseAvgRisk) * 100
    const criticalChange = scenarioCritical - baseCritical
    const highChange = scenarioHigh - baseHigh

    // Estimate accident reduction if alerts are issued
    const estimatedReduction = Math.min(30, Math.abs(riskChange) * 0.5)

    return NextResponse.json({
      base_conditions: {
        climate: body.base_climate,
        average_risk: Math.round(baseAvgRisk * 100) / 100,
        critical_zones: baseCritical,
        high_risk_zones: baseHigh,
      },
      scenario_conditions: {
        climate: body.scenario_climate,
        average_risk: Math.round(scenarioAvgRisk * 100) / 100,
        critical_zones: scenarioCritical,
        high_risk_zones: scenarioHigh,
      },
      impact_analysis: {
        risk_change_percent: Math.round(riskChange * 10) / 10,
        additional_critical_zones: criticalChange,
        additional_high_risk_zones: highChange,
        estimated_accident_reduction_with_alerts: `${Math.round(estimatedReduction)}%`,
      },
      policy_recommendations:
        riskChange > 20
          ? [
              "Issue public weather advisory",
              "Increase traffic patrol in critical zones",
              "Activate variable message signs",
              "Consider speed limit reduction on high-risk segments",
            ]
          : ["Monitor conditions", "Standard patrol deployment"],
    })
  } catch (error) {
    console.error("Scenario simulation error:", error)
    return NextResponse.json({ error: "Failed to simulate scenario" }, { status: 500 })
  }
}
