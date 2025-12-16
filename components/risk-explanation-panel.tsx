"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Lightbulb, TrendingUp } from "lucide-react"
import type { RoadSegmentWithRisk } from "@/lib/types"
import { predictRisk } from "@/lib/ml-model"
import type { ClimateConditions } from "@/lib/types"

interface RiskExplanationPanelProps {
  selectedRoad: RoadSegmentWithRisk | null
  climate: ClimateConditions
  hour: number
}

export function RiskExplanationPanel({ selectedRoad, climate, hour }: RiskExplanationPanelProps) {
  if (!selectedRoad) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Select a road segment on the map to view detailed risk analysis and climate impact.
          </p>
        </CardContent>
      </Card>
    )
  }

  const prediction = predictRisk({
    ...selectedRoad,
    ...climate,
    hour,
    day_type: "weekday",
  })

  const riskColorClass = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/50",
    High: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    Low: "bg-green-500/20 text-green-400 border-green-500/50",
  }

  const progressColor = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-green-500",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Road ID and Risk Badge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Road Segment</p>
            <p className="font-mono text-lg">{selectedRoad.road_id}</p>
          </div>
          <Badge variant="outline" className={riskColorClass[prediction.climate_risk]}>
            {prediction.climate_risk} Risk
          </Badge>
        </div>

        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className="font-mono text-2xl font-bold">{(prediction.risk_score * 100).toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${progressColor[prediction.climate_risk]}`}
              style={{ width: `${prediction.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* Top Risk Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            Contributing Factors
          </p>
          <div className="flex flex-wrap gap-2">
            {prediction.top_factors.map((factor, index) => (
              <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <Lightbulb className="h-4 w-4 text-primary" />
            Safety Recommendations
          </p>
          <ul className="space-y-1">
            {prediction.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Road Characteristics */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Road Characteristics</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Curve Radius</span>
              <span className="font-mono">{selectedRoad.curve_radius}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Speed Limit</span>
              <span className="font-mono">{selectedRoad.speed_limit} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lanes</span>
              <span className="font-mono">{selectedRoad.num_lanes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slope</span>
              <span className="font-mono">{selectedRoad.road_slope}°</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
