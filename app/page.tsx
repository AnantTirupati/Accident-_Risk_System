"use client"

import { useState, useEffect } from "react"
import { ClimateControls } from "@/components/climate-controls"
import { RiskExplanationPanel } from "@/components/risk-explanation-panel"
import { AlertSystem } from "@/components/alert-system"
import { RiskMap } from "@/components/risk-map"
import { StatsOverview } from "@/components/stats-overview"
import { getRoadSegmentsWithRisk } from "@/lib/road-data"
import type { ClimateConditions, RoadSegmentWithRisk } from "@/lib/types"
import { Activity, Cpu } from "lucide-react"

export default function AccidentRiskDashboard() {
  const [climate, setClimate] = useState<ClimateConditions>({
    weather_type: "clear",
    rain_intensity: 0,
    visibility: 1000,
    temperature: 25,
    humidity: 60,
    wind_speed: 10,
  })

  const [hour, setHour] = useState(12)
  const [roadSegments, setRoadSegments] = useState<RoadSegmentWithRisk[]>([])
  const [selectedRoad, setSelectedRoad] = useState<RoadSegmentWithRisk | null>(null)

  // Update road segments when climate or time changes
  useEffect(() => {
    const segments = getRoadSegmentsWithRisk(climate, hour)
    setRoadSegments(segments)

    // Update selected road if it exists
    if (selectedRoad) {
      const updated = segments.find((s) => s.road_id === selectedRoad.road_id)
      if (updated) {
        setSelectedRoad(updated)
      }
    }
  }, [climate, hour])

  // Sync climate controls with weather type
  useEffect(() => {
    if (climate.weather_type === "rain") {
      setClimate((prev) => ({
        ...prev,
        rain_intensity: Math.max(prev.rain_intensity, 3),
        visibility: Math.min(prev.visibility, 400),
      }))
    } else if (climate.weather_type === "fog") {
      setClimate((prev) => ({
        ...prev,
        visibility: Math.min(prev.visibility, 150),
        rain_intensity: 0,
      }))
    } else if (climate.weather_type === "storm") {
      setClimate((prev) => ({
        ...prev,
        rain_intensity: Math.max(prev.rain_intensity, 7),
        visibility: Math.min(prev.visibility, 200),
        wind_speed: Math.max(prev.wind_speed, 40),
      }))
    } else if (climate.weather_type === "clear") {
      setClimate((prev) => ({
        ...prev,
        rain_intensity: 0,
        visibility: Math.max(prev.visibility, 800),
      }))
    }
  }, [climate.weather_type])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Climate-Aware Risk Prediction</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Smart Transportation Safety</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cpu className="h-4 w-4 text-primary" />
            <span>ML Model Active</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsOverview roadSegments={roadSegments} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="col-span-3 space-y-4">
            <ClimateControls climate={climate} hour={hour} onClimateChange={setClimate} onHourChange={setHour} />
            <AlertSystem roadSegments={roadSegments} climate={climate} />
          </div>

          {/* Center - Map */}
          <div className="col-span-6 h-full min-h-500px">
            <RiskMap
              roadSegments={roadSegments}
              climate={climate}
              onSelectRoad={setSelectedRoad}
              selectedRoad={selectedRoad}
            />
          </div>

          {/* Right Sidebar - Risk Analysis */}
          <div className="col-span-3">
            <RiskExplanationPanel selectedRoad={selectedRoad} climate={climate} hour={hour} />
          </div>
        </div>
      </main>
    </div>
  )
}
