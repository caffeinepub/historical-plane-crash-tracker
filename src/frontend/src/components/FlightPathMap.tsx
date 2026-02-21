import { type CrashRecord } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlightPathMapProps {
  crash: CrashRecord;
}

export default function FlightPathMap({ crash }: FlightPathMapProps) {
  const hasFlightPath = crash.flightPath && crash.flightPath.length > 0;
  const knownPoints = crash.flightPath.filter(p => p.known).length;
  const speculativePoints = crash.flightPath.filter(p => !p.known).length;

  return (
    <div className="space-y-4">
      {/* Map Placeholder - In a real implementation, this would use react-leaflet or similar */}
      <div className="relative w-full h-[500px] bg-muted rounded-lg border border-border overflow-hidden">
        {/* Crash Location Marker */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive">
              <MapPin className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Crash Location</div>
              <div className="text-sm text-muted-foreground font-mono">
                {crash.location.latitude.toFixed(6)}°, {crash.location.longitude.toFixed(6)}°
              </div>
            </div>
          </div>
        </div>

        {/* Map Implementation Note */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-background/95 backdrop-blur">
            <CardContent className="p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                Interactive map visualization with flight path rendering would be implemented here using a mapping library like react-leaflet or mapbox-gl.
                {hasFlightPath && (
                  <span className="block mt-1">
                    Flight path data available: {knownPoints} known points, {speculativePoints} speculative points.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flight Path Legend */}
      {hasFlightPath && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" />
            <span className="text-muted-foreground">Known Route</span>
            <Badge variant="outline">{knownPoints}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-muted-foreground" />
            <span className="text-muted-foreground">Speculative Route</span>
            <Badge variant="outline">{speculativePoints}</Badge>
          </div>
        </div>
      )}

      {!hasFlightPath && (
        <Card>
          <CardContent className="py-8 text-center">
            <Navigation className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No flight path data available for this crash.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
