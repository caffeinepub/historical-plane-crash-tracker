import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllCrashRecords, useSearchCrashRecords, useGetCrashRecordsByDateRange } from '../hooks/useQueries';
import CrashListItem from '../components/CrashListItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Calendar, Plane, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'casualties'>('date');
  
  const { data: allCrashes, isLoading } = useGetAllCrashRecords();

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
        crash.aircraft.manufacturer.toLowerCase().includes(keyword) ||
        crash.crashCause.toLowerCase().includes(keyword)
      );
    }

    // Filter by phase
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(crash => crash.phaseOfFlight === phaseFilter);
    }

    // Sort
    if (sortBy === 'casualties') {
      filtered.sort((a, b) => Number(b.casualties.fatalities) - Number(a.casualties.fatalities));
    } else {
      filtered.sort((a, b) => Number(b.crashDate) - Number(a.crashDate));
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

  const phases = useMemo(() => {
    if (!allCrashes) return [];
    const uniquePhases = new Set(allCrashes.map(crash => crash.phaseOfFlight));
    return Array.from(uniquePhases).filter(Boolean);
  }, [allCrashes]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documented crashes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fatalities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFatalities.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lives lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survivors</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSurvivors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lives saved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Search by airline, flight number, aircraft model, or crash cause
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search crashes..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase">Phase of Flight</Label>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger id="phase">
                  <SelectValue placeholder="All phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All phases</SelectItem>
                  {phases.map(phase => (
                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'date' | 'casualties')}>
                <SelectTrigger id="sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                  <SelectItem value="casualties">Casualties (Highest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredAndSortedCrashes.length} {filteredAndSortedCrashes.length === 1 ? 'Result' : 'Results'}
          </h2>
        </div>

        {filteredAndSortedCrashes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No crashes found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedCrashes.map(crash => (
              <CrashListItem
                key={Number(crash.id)}
                crash={crash}
                onClick={() => navigate({ to: `/crash/${crash.id}` })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
