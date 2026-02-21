import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCrashRecords } from '../hooks/useQueries';
import CrashListItem from '../components/CrashListItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Filter, Calendar, Plane, AlertTriangle, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'casualties'>('date');
  const [includeFantasy, setIncludeFantasy] = useState(false);
  const [includeDisasterCrashes, setIncludeDisasterCrashes] = useState(false);
  const [showDisasterWarning, setShowDisasterWarning] = useState(false);
  const [hasAcknowledgedDisasterWarning, setHasAcknowledgedDisasterWarning] = useState(false);
  
  const { data: allCrashes, isLoading } = useCrashRecords(includeFantasy, includeDisasterCrashes);

  // Check if user has already acknowledged the warning in this session
  useEffect(() => {
    const acknowledged = sessionStorage.getItem('disasterCrashWarningAcknowledged');
    if (acknowledged === 'true') {
      setHasAcknowledgedDisasterWarning(true);
    }
  }, []);

  const handleDisasterCrashToggle = (checked: boolean) => {
    if (checked && !hasAcknowledgedDisasterWarning) {
      // Show warning dialog
      setShowDisasterWarning(true);
    } else {
      // Already acknowledged or unchecking
      setIncludeDisasterCrashes(checked);
    }
  };

  const handleDisasterWarningAccept = () => {
    setHasAcknowledgedDisasterWarning(true);
    sessionStorage.setItem('disasterCrashWarningAcknowledged', 'true');
    setIncludeDisasterCrashes(true);
    setShowDisasterWarning(false);
  };

  const handleDisasterWarningCancel = () => {
    setShowDisasterWarning(false);
  };

  const filteredAndSortedCrashes = useMemo(() => {
    if (!allCrashes) return [];
    
    let filtered = [...allCrashes];

    // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(crash => 
        crash.airline.toLowerCase().includes(keyword) ||
        crash.flightNumber.toLowerCase().includes(keyword) ||
        crash.aircraft.model.toLowerCase().includes(keyword) ||
        crash.aircraft.manufacturer.toLowerCase().includes(keyword)
      );
    }

    // Filter by phase
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(crash => crash.phaseOfFlight === phaseFilter);
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => Number(b.crashDate - a.crashDate));
    } else {
      filtered.sort((a, b) => Number(b.casualties.fatalities - a.casualties.fatalities));
    }

    return filtered;
  }, [allCrashes, searchKeyword, phaseFilter, sortBy]);

  const stats = useMemo(() => {
    if (!allCrashes) return { total: 0, totalFatalities: 0, totalSurvivors: 0 };
    
    return {
      total: allCrashes.length,
      totalFatalities: allCrashes.reduce((sum, crash) => sum + Number(crash.casualties.fatalities), 0),
      totalSurvivors: allCrashes.reduce((sum, crash) => sum + Number(crash.casualties.survivors), 0),
    };
  }, [allCrashes]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Aviation Crash Database</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive historical records and analysis
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/add-crash' })}>
          Add Crash Record
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crashes</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Documented incidents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fatalities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.totalFatalities}</div>
            <p className="text-xs text-muted-foreground">
              Lives lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survivors</CardTitle>
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalSurvivors}</div>
            <p className="text-xs text-muted-foreground">
              Lives saved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific crash records and filter by criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by airline, flight number, or aircraft..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phaseFilter">Phase of Flight</Label>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger id="phaseFilter">
                  <SelectValue placeholder="All phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="Takeoff">Takeoff</SelectItem>
                  <SelectItem value="Climb">Climb</SelectItem>
                  <SelectItem value="Cruise">Cruise</SelectItem>
                  <SelectItem value="Descent">Descent</SelectItem>
                  <SelectItem value="Approach">Approach</SelectItem>
                  <SelectItem value="Landing">Landing</SelectItem>
                  <SelectItem value="Ground">Ground</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'date' | 'casualties')}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                  <SelectItem value="casualties">Casualties (Highest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeFantasy" 
                checked={includeFantasy}
                onCheckedChange={(checked) => setIncludeFantasy(checked === true)}
              />
              <Label 
                htmlFor="includeFantasy" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                Show Fantasy/Fictional Crashes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeDisasterCrashes" 
                checked={includeDisasterCrashes}
                onCheckedChange={handleDisasterCrashToggle}
              />
              <Label 
                htmlFor="includeDisasterCrashes" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Show Disaster Crashes (Multiple Aircraft)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crash List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Crash Records ({filteredAndSortedCrashes.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedCrashes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No crash records found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedCrashes.map((crash) => (
              <CrashListItem
                key={Number(crash.id)}
                crash={crash}
                onClick={() => navigate({ to: `/crash/${crash.id}` })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Disaster Crash Warning Dialog */}
      <AlertDialog open={showDisasterWarning} onOpenChange={setShowDisasterWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Disaster Crash Content Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                You are about to view disaster crash records involving multiple aircraft. 
                These incidents often contain graphic details about severe accidents with 
                significant casualties and may be disturbing.
              </p>
              <p className="font-medium text-foreground">
                This content may include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Multiple aircraft collisions</li>
                <li>High casualty counts across multiple planes</li>
                <li>Detailed descriptions of catastrophic failures</li>
                <li>Graphic investigation details</li>
              </ul>
              <p className="text-sm">
                Please proceed only if you are prepared to view this sensitive material.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDisasterWarningCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDisasterWarningAccept}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
