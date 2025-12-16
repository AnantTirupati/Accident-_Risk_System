"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cloud, CloudRain, CloudFog, CloudLightning, Thermometer, Wind, Droplets, Eye } from "lucide-react"
import type { ClimateConditions } from "@/lib/types"

interface ClimateControlsProps {
  climate: ClimateConditions
  hour: number
  onClimateChange: (climate: ClimateConditions) => void
  onHourChange: (hour: number) => void
}

const weatherIcons = {
  clear: Cloud,
  rain: CloudRain,
  fog: CloudFog,
  storm: CloudLightning,
}

export function ClimateControls({ climate, hour, onClimateChange, onHourChange }: ClimateControlsProps) {
  const WeatherIcon = weatherIcons[climate.weather_type]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <WeatherIcon className="h-5 w-5 text-primary" />
          Climate Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Weather Type */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Weather Condition</Label>
          <Select
            value={climate.weather_type}
            onValueChange={(value: ClimateConditions["weather_type"]) =>
              onClimateChange({ ...climate, weather_type: value })
            }
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">
                <span className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" /> Clear
                </span>
              </SelectItem>
              <SelectItem value="rain">
                <span className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4" /> Rain
                </span>
              </SelectItem>
              <SelectItem value="fog">
                <span className="flex items-center gap-2">
                  <CloudFog className="h-4 w-4" /> Fog
                </span>
              </SelectItem>
              <SelectItem value="storm">
                <span className="flex items-center gap-2">
                  <CloudLightning className="h-4 w-4" /> Storm
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time of Day */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Time of Day</Label>
            <span className="text-sm font-mono text-foreground">{hour.toString().padStart(2, "0")}:00</span>
          </div>
          <Slider
            value={[hour]}
            onValueChange={([value]) => onHourChange(value)}
            min={0}
            max={23}
            step={1}
            className="py-2"
          />
        </div>

        {/* Rain Intensity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" /> Rain Intensity
            </Label>
            <span className="text-sm font-mono text-foreground">{climate.rain_intensity.toFixed(1)} mm/h</span>
          </div>
          <Slider
            value={[climate.rain_intensity]}
            onValueChange={([value]) => onClimateChange({ ...climate, rain_intensity: value })}
            min={0}
            max={10}
            step={0.5}
            className="py-2"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Visibility
            </Label>
            <span className="text-sm font-mono text-foreground">{climate.visibility} m</span>
          </div>
          <Slider
            value={[climate.visibility]}
            onValueChange={([value]) => onClimateChange({ ...climate, visibility: value })}
            min={50}
            max={1000}
            step={50}
            className="py-2"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5" /> Temperature
            </Label>
            <span className="text-sm font-mono text-foreground">{climate.temperature}°C</span>
          </div>
          <Slider
            value={[climate.temperature]}
            onValueChange={([value]) => onClimateChange({ ...climate, temperature: value })}
            min={-10}
            max={50}
            step={1}
            className="py-2"
          />
        </div>

        {/* Wind Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" /> Wind Speed
            </Label>
            <span className="text-sm font-mono text-foreground">{climate.wind_speed} km/h</span>
          </div>
          <Slider
            value={[climate.wind_speed]}
            onValueChange={([value]) => onClimateChange({ ...climate, wind_speed: value })}
            min={0}
            max={60}
            step={5}
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
