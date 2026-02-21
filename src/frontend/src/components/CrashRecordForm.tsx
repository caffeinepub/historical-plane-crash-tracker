import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAddCrashRecord } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getAircraftTypePreview } from '../utils/aircraftModelMapping';

export default function CrashRecordForm() {
  const navigate = useNavigate();
  const addCrashMutation = useAddCrashRecord();

  const [formData, setFormData] = useState({
    crashDate: '',
    latitude: '',
    longitude: '',
    airline: '',
    flightNumber: '',
    manufacturer: '',
    model: '',
    year: '',
    registrationNumber: '',
    ICAOType: '',
    aircraftType: '',
    phaseOfFlight: '',
    totalAboard: '',
    fatalities: '',
    survivors: '',
    crewFatalities: '',
    passengerFatalities: '',
    crashCause: '',
    source: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.crashDate || !formData.latitude || !formData.longitude || !formData.airline) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const crashDate = BigInt(new Date(formData.crashDate).getTime() * 1000000);
      
      const id = await addCrashMutation.mutateAsync({
        crashDate,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        airline: formData.airline,
        flightNumber: formData.flightNumber,
        aircraft: {
          manufacturer: formData.manufacturer,
          model: formData.model,
          year: formData.year ? BigInt(formData.year) : undefined,
          registrationNumber: formData.registrationNumber,
          ICAOType: formData.ICAOType,
          aircraftType: formData.aircraftType,
        },
        phaseOfFlight: formData.phaseOfFlight,
        casualties: {
          totalAboard: BigInt(formData.totalAboard || 0),
          fatalities: BigInt(formData.fatalities || 0),
          survivors: BigInt(formData.survivors || 0),
          crewFatalities: BigInt(formData.crewFatalities || 0),
          passengerFatalities: BigInt(formData.passengerFatalities || 0),
        },
        crashCause: formData.crashCause,
        source: formData.source,
        investigationTimeline: [],
        flightPath: [],
      });

      toast.success('Crash record added successfully');
      navigate({ to: `/crash/${id}` });
    } catch (error) {
      toast.error('Failed to add crash record');
      console.error(error);
    }
  };

  const aircraftPreview = getAircraftTypePreview(formData.aircraftType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="crashDate">Crash Date *</Label>
            <Input
              id="crashDate"
              type="date"
              value={formData.crashDate}
              onChange={(e) => handleChange('crashDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Data Source *</Label>
            <Input
              id="source"
              placeholder="e.g., NTSB, ASN, ICAO"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Reference the official source of this data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airline">Airline *</Label>
            <Input
              id="airline"
              placeholder="e.g., United Airlines"
              value={formData.airline}
              onChange={(e) => handleChange('airline', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number *</Label>
            <Input
              id="flightNumber"
              placeholder="e.g., UA232"
              value={formData.flightNumber}
              onChange={(e) => handleChange('flightNumber', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g., 40.7128"
              value={formData.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g., -74.0060"
              value={formData.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Aircraft Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Aircraft Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="e.g., Boeing"
              value={formData.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g., 737-800"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aircraftType">Aircraft Type</Label>
            <Input
              id="aircraftType"
              placeholder="e.g., Boeing 737"
              value={formData.aircraftType}
              onChange={(e) => handleChange('aircraftType', e.target.value)}
            />
            {aircraftPreview && (
              <p className="text-xs text-muted-foreground">
                3D Model: {aircraftPreview}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              placeholder="e.g., N12345"
              value={formData.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ICAOType">ICAO Type Code</Label>
            <Input
              id="ICAOType"
              placeholder="e.g., B738"
              value={formData.ICAOType}
              onChange={(e) => handleChange('ICAOType', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year Built</Label>
            <Input
              id="year"
              type="number"
              placeholder="e.g., 2005"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phaseOfFlight">Phase of Flight</Label>
          <Select value={formData.phaseOfFlight} onValueChange={(val) => handleChange('phaseOfFlight', val)}>
            <SelectTrigger id="phaseOfFlight">
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
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
      </div>

      {/* Casualty Data */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Casualty Information</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAboard">Total Aboard</Label>
            <Input
              id="totalAboard"
              type="number"
              min="0"
              value={formData.totalAboard}
              onChange={(e) => handleChange('totalAboard', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatalities">Fatalities</Label>
            <Input
              id="fatalities"
              type="number"
              min="0"
              value={formData.fatalities}
              onChange={(e) => handleChange('fatalities', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="survivors">Survivors</Label>
            <Input
              id="survivors"
              type="number"
              min="0"
              value={formData.survivors}
              onChange={(e) => handleChange('survivors', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crewFatalities">Crew Fatalities</Label>
            <Input
              id="crewFatalities"
              type="number"
              min="0"
              value={formData.crewFatalities}
              onChange={(e) => handleChange('crewFatalities', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengerFatalities">Passenger Fatalities</Label>
            <Input
              id="passengerFatalities"
              type="number"
              min="0"
              value={formData.passengerFatalities}
              onChange={(e) => handleChange('passengerFatalities', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Crash Cause */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Crash Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="crashCause">Crash Cause</Label>
          <Textarea
            id="crashCause"
            placeholder="Detailed description of the crash cause and circumstances..."
            value={formData.crashCause}
            onChange={(e) => handleChange('crashCause', e.target.value)}
            rows={6}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={addCrashMutation.isPending}>
          {addCrashMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Crash Record
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/' })}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
