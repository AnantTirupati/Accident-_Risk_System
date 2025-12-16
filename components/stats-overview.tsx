"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Shield, TrendingUp, MapPin } from "lucide-react"
import type { RoadSegmentWithRisk } from "@/lib/types"

interface StatsOverviewProps {
  roadSegments: RoadSegmentWithRisk[]
}

export function StatsOverview({ roadSegments }: StatsOverviewProps) {
  const criticalCount = roadSegments.filter((r) => r.climate_risk === "Critical").length
  const highCount = roadSegments.filter((r) => r.climate_risk === "High").length
  const safeCount = roadSegments.filter((r) => r.climate_risk === "Low").length
  const avgRisk = roadSegments.reduce((sum, r) => sum + r.risk_score, 0) / roadSegments.length

  const stats = [
    {
      label: "Total Segments",
      value: roadSegments.length,
      icon: MapPin,
      color: "text-primary",
    },
    {
      label: "Critical Zones",
      value: criticalCount,
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      label: "High Risk",
      value: highCount,
      icon: TrendingUp,
      color: "text-orange-400",
    },
    {
      label: "Safe Zones",
      value: safeCount,
      icon: Shield,
      color: "text-green-400",
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
