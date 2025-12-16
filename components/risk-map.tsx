"use client"

import { GoogleMap, LoadScript, Polyline } from "@react-google-maps/api"
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

// fallback (India center)
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

  // Auto-center map using first road segment midpoint
  const center =
  roadSegments.find((s) => s.geometry)?.geometry
    ? {
        lat:
          (roadSegments[0].geometry.start.lat +
            roadSegments[0].geometry.end.lat) /
          2,
        lng:
          (roadSegments[0].geometry.start.lng +
            roadSegments[0].geometry.end.lng) /
          2,
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
        <LoadScript
          googleMapsApiKey={
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
          }
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={11}
          >
            {roadSegments
              .filter(
                (segment) =>
                  segment.geometry?.start && segment.geometry?.end
              )
              .map((segment) => {
                const riskColor = getRiskColor(
                  segment.risk_score,
                  climate.weather_type
                )

                const isSelected =
                  selectedRoad?.road_id === segment.road_id

                return (
                  <Polyline
                    key={segment.road_id}
                    path={[
                      {
                        lat: segment.geometry.start.lat,
                        lng: segment.geometry.start.lng,
                      },
                      {
                        lat: segment.geometry.end.lat,
                        lng: segment.geometry.end.lng,
                      },
                    ]}
                    options={{
                      strokeColor: riskColor,
                      strokeOpacity: 0.9,
                      strokeWeight: isSelected ? 8 : 5,
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
