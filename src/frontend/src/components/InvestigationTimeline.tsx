import { useState } from 'react';
import { type InvestigationEntry } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, User, FileText, ChevronDown, ChevronUp, Plus, Image as ImageIcon, Video } from 'lucide-react';
import AddInvestigationEntryForm from './AddInvestigationEntryForm';

interface InvestigationTimelineProps {
  crashId: number;
  entries: InvestigationEntry[];
}

function TimelineEntry({ entry }: { entry: InvestigationEntry }) {
  const [expanded, setExpanded] = useState(false);
  const entryDate = new Date(Number(entry.timestamp) / 1000000);

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'preliminary':
        return 'default';
      case 'interim':
        return 'secondary';
      case 'final':
        return 'destructive';
      case 'safety recommendations':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary border-4 border-background" />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {entryDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {entry.title && (
                <CardTitle className="text-lg">{entry.title}</CardTitle>
              )}
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <Badge key={idx} variant={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {entry.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {expanded || entry.description.length <= 200
              ? entry.description
              : `${entry.description.substring(0, 200)}...`}
          </div>

          {entry.author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{entry.author}</span>
            </div>
          )}

          {/* Photos */}
          {entry.photos && entry.photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Attached Photos ({entry.photos.length})
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {entry.photos.map((photo, idx) => (
                  <div key={idx} className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={photo.getDirectURL()}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media URLs */}
          {entry.mediaUrls && entry.mediaUrls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Video className="h-4 w-4" />
                Media Links ({entry.mediaUrls.length})
              </div>
              <div className="space-y-1">
                {entry.mediaUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvestigationTimeline({ crashId, entries }: InvestigationTimelineProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sortedEntries = [...entries].sort((a, b) => 
    Number(a.timestamp) - Number(b.timestamp)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Investigation Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Chronological documentation of investigation progress
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Investigation Entry</DialogTitle>
                </DialogHeader>
                <AddInvestigationEntryForm 
                  crashId={crashId} 
                  onSuccess={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {sortedEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No investigation entries yet. Add the first entry to begin documenting the investigation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-0">
          {sortedEntries.map((entry) => (
            <TimelineEntry key={Number(entry.id)} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
