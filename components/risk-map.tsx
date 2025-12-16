"use client"

import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api"
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

const containerStyle = {
  width: "100%",
  height: "100%",
}

// fallback (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
}

export function RiskMap({
  roadSegments,
  climate,
  onSelectRoad,
  selectedRoad,
}: RiskMapProps) {
  const WeatherIcon = weatherIcons[climate.weather_type]

  // auto-center map using first segment
  const center =
    roadSegments.length > 0
      ? {
          lat: roadSegments[0].latitude,
          lng: roadSegments[0].longitude,
        }
      : defaultCenter

  return (
    <Card className="bg-card border-border overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Live Risk Heatmap</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <WeatherIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs capitalize text-muted-foreground">
              {climate.weather_type}
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <Legend color="bg-green-500" label="Safe" />
            <Legend color="bg-yellow-500" label="Medium" />
            <Legend color="bg-orange-500" label="High" />
            <Legend color="bg-red-500" label="Critical" />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[450px]">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={8}
          >
            {roadSegments.map((segment) => {
              const riskColor = getRiskColor(
                segment.risk_score,
                climate.weather_type
              )

              const isSelected =
                selectedRoad?.road_id === segment.road_id

              return (
                <Circle
                  key={segment.road_id}
                  center={{
                    lat: segment.latitude,
                    lng: segment.longitude,
                  }}
                  radius={isSelected ? 6000 : 4000}
                  options={{
                    fillColor: riskColor,
                    fillOpacity: isSelected ? 0.7 : 0.5,
                    strokeColor: isSelected ? "#000000" : undefined,
                    strokeWeight: isSelected ? 2 : 0,
                  }}
                  onClick={() => onSelectRoad(segment)}
                />
              )
            })}
          </GoogleMap>
        </LoadScript>
      </div>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
