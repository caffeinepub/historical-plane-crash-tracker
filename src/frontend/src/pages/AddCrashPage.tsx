import { useNavigate } from '@tanstack/react-router';
import CrashRecordForm from '../components/CrashRecordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddCrashPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Add Crash Record</CardTitle>
          <CardDescription>
            Enter comprehensive crash data from official sources (NTSB, ASN, ICAO, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrashRecordForm />
        </CardContent>
      </Card>
    </div>
  );
}
