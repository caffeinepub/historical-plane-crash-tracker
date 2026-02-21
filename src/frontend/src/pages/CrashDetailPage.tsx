import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetCrashRecord } from '../hooks/useQueries';
import { ArrowLeft, MapPin, Calendar, Plane as PlaneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CrashDetailsPanel from '../components/CrashDetailsPanel';
import FlightPathMap from '../components/FlightPathMap';
import CrashReconstruction3D from '../components/CrashReconstruction3D';
import InvestigationTimeline from '../components/InvestigationTimeline';

export default function CrashDetailPage() {
  const { id } = useParams({ from: '/crash/$id' });
  const navigate = useNavigate();
  const { data: crash, isLoading } = useGetCrashRecord(Number(id));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!crash) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Crash record not found.</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const crashDate = new Date(Number(crash.crashDate) / 1000000);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {crash.airline} Flight {crash.flightNumber}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {crashDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-2">
            <PlaneIcon className="h-4 w-4" />
            {crash.aircraft.manufacturer} {crash.aircraft.model}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {crash.location.latitude.toFixed(4)}°, {crash.location.longitude.toFixed(4)}°
          </div>
        </div>
      </div>

      {/* Main Content */}
      <CrashDetailsPanel crash={crash} />

      {/* Tabs for different views */}
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="map">Flight Path</TabsTrigger>
          <TabsTrigger value="3d">3D Reconstruction</TabsTrigger>
          <TabsTrigger value="timeline">Investigation</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flight Path Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <FlightPathMap crash={crash} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3d" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>3D Crash Reconstruction</CardTitle>
            </CardHeader>
            <CardContent>
              <CrashReconstruction3D crash={crash} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <InvestigationTimeline crashId={Number(crash.id)} entries={crash.investigationTimeline} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
