import { type CrashRecord } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Plane, Users, AlertTriangle } from 'lucide-react';

interface CrashListItemProps {
  crash: CrashRecord;
  onClick: () => void;
}

export default function CrashListItem({ crash, onClick }: CrashListItemProps) {
  const crashDate = new Date(Number(crash.crashDate) / 1000000);
  const fatalityRate = Number(crash.casualties.totalAboard) > 0
    ? (Number(crash.casualties.fatalities) / Number(crash.casualties.totalAboard) * 100).toFixed(1)
    : '0';

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg">
                {crash.airline} Flight {crash.flightNumber}
              </h3>
              <Badge variant={Number(crash.casualties.survivors) > 0 ? 'default' : 'destructive'}>
                {Number(crash.casualties.survivors) > 0 ? 'Survivors' : 'No Survivors'}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {crashDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <Plane className="h-3.5 w-3.5" />
                {crash.aircraft.manufacturer} {crash.aircraft.model}
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {crash.location.latitude.toFixed(2)}°, {crash.location.longitude.toFixed(2)}°
              </div>

              {crash.phaseOfFlight && (
                <Badge variant="outline" className="text-xs">
                  {crash.phaseOfFlight}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs">Aboard</span>
              </div>
              <div className="text-lg font-semibold">
                {Number(crash.casualties.totalAboard)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 text-destructive mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-xs">Fatalities</span>
              </div>
              <div className="text-lg font-semibold text-destructive">
                {Number(crash.casualties.fatalities)}
              </div>
              <div className="text-xs text-muted-foreground">
                ({fatalityRate}%)
              </div>
            </div>

            {Number(crash.casualties.survivors) > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs">Survivors</span>
                </div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {Number(crash.casualties.survivors)}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
