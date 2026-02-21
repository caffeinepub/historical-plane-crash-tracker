import { useState } from 'react';
import { useAddInvestigationEntry, useAttachPhotoToEntry } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ExternalBlob } from '../backend';

interface AddInvestigationEntryFormProps {
  crashId: number;
  onSuccess: () => void;
}

const TAG_OPTIONS = ['Preliminary', 'Interim', 'Final', 'Safety Recommendations'];

export default function AddInvestigationEntryForm({ crashId, onSuccess }: AddInvestigationEntryFormProps) {
  const addEntryMutation = useAddInvestigationEntry();
  const attachPhotoMutation = useAttachPhotoToEntry();

  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    title: '',
    description: '',
    author: '',
    mediaUrls: [''],
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.mediaUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, mediaUrls: newUrls }));
  };

  const addMediaUrl = () => {
    setFormData(prev => ({ ...prev, mediaUrls: [...prev.mediaUrls, ''] }));
  };

  const removeMediaUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotoFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      const timestamp = BigInt(new Date(formData.timestamp).getTime() * 1000000);
      const mediaUrls = formData.mediaUrls.filter(url => url.trim() !== '');

      // Add the entry first
      const entryId = await addEntryMutation.mutateAsync({
        crashId: BigInt(crashId),
        timestamp,
        description: formData.description,
        author: formData.author,
        mediaUrls,
      });

      // Upload photos if any
      if (photoFiles.length > 0) {
        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i];
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress(percentage);
          });

          await attachPhotoMutation.mutateAsync({
            crashId: BigInt(crashId),
            entryId,
            photo: blob,
          });
        }
      }

      toast.success('Investigation entry added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add investigation entry');
      console.error(error);
    }
  };

  const isSubmitting = addEntryMutation.isPending || attachPhotoMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timestamp">Date & Time *</Label>
            <Input
              id="timestamp"
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => handleChange('timestamp', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="e.g., NTSB Investigator"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g., Preliminary Report Released"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Detailed description of this investigation milestone..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photos">Photos</Label>
          <Input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
          />
          {photoFiles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {photoFiles.length} file(s) selected
            </p>
          )}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <p className="text-xs text-muted-foreground">
              Uploading: {uploadProgress}%
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Media URLs (Videos, Documents)</Label>
          {formData.mediaUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://..."
                value={url}
                onChange={(e) => handleMediaUrlChange(index, e.target.value)}
              />
              {formData.mediaUrls.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMediaUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMediaUrl}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Add Media URL
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Entry
        </Button>
      </div>
    </form>
  );
}
