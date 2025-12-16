"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, AlertTriangle, CloudRain, CloudFog, ThermometerSnowflake, Wind } from "lucide-react"
import type { RoadSegmentWithRisk, ClimateConditions } from "@/lib/types"

interface AlertSystemProps {
  roadSegments: RoadSegmentWithRisk[]
  climate: ClimateConditions
}

interface RiskAlert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  description: string
  icon: React.ElementType
}

export function AlertSystem({ roadSegments, climate }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])

  useEffect(() => {
    const newAlerts: RiskAlert[] = []

    // Check for critical road segments
    const criticalRoads = roadSegments.filter((r) => r.climate_risk === "Critical")
    const highRiskRoads = roadSegments.filter((r) => r.climate_risk === "High")

    if (criticalRoads.length > 0) {
      newAlerts.push({
        id: "critical-roads",
        type: "critical",
        title: `${criticalRoads.length} Critical Risk Zone${criticalRoads.length > 1 ? "s" : ""} Detected`,
        description: `Roads ${criticalRoads.map((r) => r.road_id).join(", ")} have critical accident risk. Avoid if possible.`,
        icon: AlertTriangle,
      })
    }

    if (highRiskRoads.length > 0 && criticalRoads.length === 0) {
      newAlerts.push({
        id: "high-risk-roads",
        type: "warning",
        title: `${highRiskRoads.length} High Risk Zone${highRiskRoads.length > 1 ? "s" : ""} Active`,
        description: `Exercise caution on roads ${highRiskRoads.map((r) => r.road_id).join(", ")}.`,
        icon: AlertTriangle,
      })
    }

    // Weather-specific alerts
    if (climate.weather_type === "rain" && climate.rain_intensity > 5) {
      newAlerts.push({
        id: "heavy-rain",
        type: "warning",
        title: "Heavy Rain Warning",
        description: "Reduced traction and visibility. Increase following distance.",
        icon: CloudRain,
      })
    }

    if (climate.weather_type === "fog" || climate.visibility < 200) {
      newAlerts.push({
        id: "low-visibility",
        type: "warning",
        title: "Low Visibility Alert",
        description: "Use fog lights and reduce speed. Visibility under 200m.",
        icon: CloudFog,
      })
    }

    if (climate.temperature < 5) {
      newAlerts.push({
        id: "cold-temp",
        type: "info",
        title: "Cold Weather Advisory",
        description: "Watch for icy patches. Roads may be slippery.",
        icon: ThermometerSnowflake,
      })
    }

    if (climate.wind_speed > 40) {
      newAlerts.push({
        id: "high-wind",
        type: "warning",
        title: "High Wind Warning",
        description: "Two-wheelers and tall vehicles should exercise extreme caution.",
        icon: Wind,
      })
    }

    setAlerts(newAlerts)
  }, [roadSegments, climate])

  const alertStyles = {
    critical: "border-red-500/50 bg-red-500/10 text-red-400",
    warning: "border-orange-500/50 bg-orange-500/10 text-orange-400",
    info: "border-blue-500/50 bg-blue-500/10 text-blue-400",
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Active Alerts
          {alerts.length > 0 && (
            <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active alerts. Conditions are favorable.</p>
        ) : (
          alerts.map((alert) => (
            <Alert key={alert.id} className={alertStyles[alert.type]}>
              <alert.icon className="h-4 w-4" />
              <AlertTitle className="text-sm font-medium">{alert.title}</AlertTitle>
              <AlertDescription className="text-xs opacity-90">{alert.description}</AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  )
}
