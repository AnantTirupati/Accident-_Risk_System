"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { CloudRain, CloudFog, CloudLightning, Cloud, MapPin } from "lucide-react"
import type { RoadSegmentWithRisk, ClimateConditions } from "@/lib/types"
import { getRiskColor } from "@/lib/ml-model"

interface RiskMapProps {
  roadSegments: RoadSegmentWithRisk[]
  climate: ClimateConditions
  onSelectRoad: (road: RoadSegmentWithRisk | null) => void
  selectedRoad: RoadSegmentWithRisk | null
}

const weatherIcons = {
  clear: Cloud,
  rain: CloudRain,
  fog: CloudFog,
  storm: CloudLightning,
}

export function RiskMap({ roadSegments, climate, onSelectRoad, selectedRoad }: RiskMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  // Calculate map bounds
  const bounds = {
    minLat: Math.min(...roadSegments.map((r) => r.latitude)) - 0.02,
    maxLat: Math.max(...roadSegments.map((r) => r.latitude)) + 0.02,
    minLng: Math.min(...roadSegments.map((r) => r.longitude)) - 0.02,
    maxLng: Math.max(...roadSegments.map((r) => r.longitude)) + 0.02,
  }

  // Convert lat/lng to canvas coordinates
  const toCanvasCoords = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * dimensions.width
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * dimensions.height
    return { x, y }
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: Math.max(400, rect.height - 60) })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#0f1629"
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Draw grid
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1

    for (let i = 0; i < dimensions.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, dimensions.height)
      ctx.stroke()
    }

    for (let i = 0; i < dimensions.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(dimensions.width, i)
      ctx.stroke()
    }

    // Draw simulated road connections
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 3

    const sortedByLat = [...roadSegments].sort((a, b) => a.latitude - b.latitude)
    for (let i = 0; i < sortedByLat.length - 1; i++) {
      const start = toCanvasCoords(sortedByLat[i].latitude, sortedByLat[i].longitude)
      const end = toCanvasCoords(sortedByLat[i + 1].latitude, sortedByLat[i + 1].longitude)

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    // Draw weather effects overlay
    if (climate.weather_type === "rain") {
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
    } else if (climate.weather_type === "fog") {
      ctx.fillStyle = "rgba(148, 163, 184, 0.15)"
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
    } else if (climate.weather_type === "storm") {
      ctx.fillStyle = "rgba(124, 58, 237, 0.1)"
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
    }

    // Draw road segments as circles with risk colors
    roadSegments.forEach((segment) => {
      const { x, y } = toCanvasCoords(segment.latitude, segment.longitude)
      const color = getRiskColor(segment.risk_score, climate.weather_type)
      const isSelected = selectedRoad?.road_id === segment.road_id

      // Outer glow for high risk
      if (segment.risk_score >= 0.5) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40)
        gradient.addColorStop(0, color + "60")
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 40, 0, Math.PI * 2)
        ctx.fill()
      }

      // Main circle
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, isSelected ? 18 : 14, 0, Math.PI * 2)
      ctx.fill()

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, 22, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Risk score label
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 10px Geist"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${Math.round(segment.risk_score * 100)}`, x, y)
    })
  }, [roadSegments, climate, dimensions, selectedRoad, bounds])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked road segment
    for (const segment of roadSegments) {
      const coords = toCanvasCoords(segment.latitude, segment.longitude)
      const distance = Math.sqrt((x - coords.x) ** 2 + (y - coords.y) ** 2)

      if (distance < 20) {
        onSelectRoad(segment)
        return
      }
    }

    onSelectRoad(null)
  }

  const WeatherIcon = weatherIcons[climate.weather_type]

  return (
    <Card className="bg-card border-border overflow-hidden h-full" ref={containerRef}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Live Risk Heatmap</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <WeatherIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">{climate.weather_type}</span>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Safe</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Critical</span>
            </div>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="cursor-pointer"
      />
    </Card>
  )
}
