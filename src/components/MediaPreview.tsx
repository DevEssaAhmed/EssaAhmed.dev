import { OptimizedImage } from "@/components/OptimizedImage";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Play } from 'lucide-react';

interface MediaPreviewProps {
  files: string[];
  type: 'image' | 'video';
  onRemove: (index: number) => void;
  className?: string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ files, type, onRemove, className = "" }) => {
  if (!files || files.length === 0) return null;

  const renderPreview = (file: string, index: number) => {
    if (type === 'image') {
      return (
        <Card key={index} className={`relative group overflow-hidden ${className}`}>
          <CardContent className="p-0">
            <OptimizedImage 
              src={file} 
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover"
              onError={(e: any) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <Card key={index} className={`relative group overflow-hidden ${className}`}>
          <CardContent className="p-0">
            <div className="w-full h-32 bg-muted flex items-center justify-center relative">
              {file.includes('youtube.com') || file.includes('youtu.be') ? (
                <div className="text-center">
                  <Play className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">YouTube Video</p>
                </div>
              ) : file.includes('vimeo.com') ? (
                <div className="text-center">
                  <Play className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Vimeo Video</p>
                </div>
              ) : (
                <video 
                  src={file} 
                  className="w-full h-full object-cover"
                  muted
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-center"><Play class="w-8 h-8 mx-auto mb-2 text-primary" /><p class="text-sm text-muted-foreground">Video File</p></div>';
                    }
                  }}
                />
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file, index) => renderPreview(file, index))}
    </div>
  );
};

export default MediaPreview;

