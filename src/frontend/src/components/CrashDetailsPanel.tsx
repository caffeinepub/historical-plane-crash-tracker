import { type CrashRecord } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Heart, FileText } from 'lucide-react';

interface CrashDetailsPanelProps {
  crash: CrashRecord;
}

export default function CrashDetailsPanel({ crash }: CrashDetailsPanelProps) {
  const totalAboard = Number(crash.casualties.totalAboard);
  const fatalities = Number(crash.casualties.fatalities);
  const survivors = Number(crash.casualties.survivors);
  const fatalityRate = totalAboard > 0 ? (fatalities / totalAboard) * 100 : 0;
  const survivalRate = totalAboard > 0 ? (survivors / totalAboard) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Casualty Statistics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Casualty Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Aboard</div>
              <div className="text-3xl font-bold">{totalAboard}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Fatalities
              </div>
              <div className="text-3xl font-bold text-destructive">{fatalities}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                Survivors
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{survivors}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Survival Rate</div>
              <div className="text-3xl font-bold">{survivalRate.toFixed(1)}%</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fatality Rate</span>
                <span className="font-medium">{fatalityRate.toFixed(1)}%</span>
              </div>
              <Progress value={fatalityRate} className="h-2" />
            </div>

            {totalAboard > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Crew Fatalities</div>
                  <div className="font-semibold">{Number(crash.casualties.crewFatalities)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Passenger Fatalities</div>
                  <div className="font-semibold">{Number(crash.casualties.passengerFatalities)}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aircraft & Flight Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Flight Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Aircraft</div>
              <div className="font-semibold">
                {crash.aircraft.manufacturer} {crash.aircraft.model}
              </div>
            </div>

            {crash.aircraft.registrationNumber && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Registration</div>
                <div className="font-mono text-sm">{crash.aircraft.registrationNumber}</div>
              </div>
            )}

            {crash.aircraft.year && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Year Built</div>
                <div className="font-semibold">{Number(crash.aircraft.year)}</div>
              </div>
            )}

            {crash.phaseOfFlight && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Phase of Flight</div>
                <Badge variant="outline">{crash.phaseOfFlight}</Badge>
              </div>
            )}

            {crash.source && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Data Source</div>
                <div className="text-sm">{crash.source}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crash Cause */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Crash Cause
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {crash.crashCause || 'No crash cause information available.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
