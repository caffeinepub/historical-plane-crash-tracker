import { type CrashRecord, VerificationStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Heart, FileText, CheckCircle2, AlertCircle, Sparkles, Plane } from 'lucide-react';

interface CrashDetailsPanelProps {
  crash: CrashRecord;
}

export default function CrashDetailsPanel({ crash }: CrashDetailsPanelProps) {
  const totalAboard = Number(crash.casualties.totalAboard);
  const fatalities = Number(crash.casualties.fatalities);
  const survivors = Number(crash.casualties.survivors);
  const fatalityRate = totalAboard > 0 ? (fatalities / totalAboard) * 100 : 0;
  const survivalRate = totalAboard > 0 ? (survivors / totalAboard) * 100 : 0;

  const getVerificationBadge = () => {
    switch (crash.verificationStatus) {
      case VerificationStatus.verified:
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        );
      case VerificationStatus.unverified:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Not a Real Crash
          </Badge>
        );
      case VerificationStatus.fantasy:
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Fantasy/Fictional
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calculate total casualties across all involved aircraft for disaster crashes
  const calculateTotalDisasterCasualties = () => {
    if (!crash.isDisasterCrash || crash.involvedAircraft.length === 0) {
      return null;
    }

    const totalAboard = crash.involvedAircraft.reduce(
      (sum, aircraft) => sum + Number(aircraft.casualties.totalAboard),
      0
    );
    const totalFatalities = crash.involvedAircraft.reduce(
      (sum, aircraft) => sum + Number(aircraft.casualties.fatalities),
      0
    );
    const totalSurvivors = crash.involvedAircraft.reduce(
      (sum, aircraft) => sum + Number(aircraft.casualties.survivors),
      0
    );

    return { totalAboard, totalFatalities, totalSurvivors };
  };

  const disasterTotals = calculateTotalDisasterCasualties();

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
              <div className="text-xs text-muted-foreground mb-1">Verification Status</div>
              {getVerificationBadge()}
            </div>

            <Separator />

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

            <Separator />

            {crash.source && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Data Source</div>
                <div className="text-sm">{crash.source}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  {crash.sourceVerification ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Source Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Source Not Verified
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multiple Aircraft Involved Section */}
      {crash.isDisasterCrash && crash.involvedAircraft.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Multiple Aircraft Involved - Disaster Crash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {disasterTotals && (
              <>
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Aboard (All Aircraft)</div>
                      <div className="text-2xl font-bold">{disasterTotals.totalAboard}</div>
                    </div>
                    <div>
                      <div className="text-sm text-destructive mb-1">Total Fatalities</div>
                      <div className="text-2xl font-bold text-destructive">{disasterTotals.totalFatalities}</div>
                    </div>
                    <div>
                      <div className="text-sm text-green-600 dark:text-green-400 mb-1">Total Survivors</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{disasterTotals.totalSurvivors}</div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Aircraft Involved:</h4>
              {crash.involvedAircraft.map((involved, index) => (
                <Card key={index} className="border-orange-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      Aircraft {index + 1}: {involved.airline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Aircraft</div>
                        <div className="font-semibold">
                          {involved.aircraft.manufacturer} {involved.aircraft.model}
                        </div>
                      </div>
                      {involved.registrationNumber && (
                        <div>
                          <div className="text-xs text-muted-foreground">Registration</div>
                          <div className="font-mono text-sm">{involved.registrationNumber}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground">Total Aboard</div>
                        <div className="font-semibold">{Number(involved.casualties.totalAboard)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-destructive">Fatalities</div>
                        <div className="font-semibold text-destructive">{Number(involved.casualties.fatalities)}</div>
                      </div>
                    </div>
                    {Number(involved.casualties.survivors) > 0 && (
                      <div className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {Number(involved.casualties.survivors)} survivors
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
