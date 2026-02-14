import { OptimizedImage } from "@/components/OptimizedImage";
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  className?: string;
}

const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  className = ""
}) => {
  const { toast } = useToast();

  const extractAvatarFileName = (url: string) => {
    const marker = '/storage/v1/object/public/avatars/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const fileName = url.substring(idx + marker.length);
    return fileName || null;
  };

  const handleAvatarUpload = async (urls: string[]) => {
    if (urls.length === 0) return;

    const newAvatarUrl = urls[0];

    try {
      // If there's an existing avatar, delete it from storage
      if (currentAvatarUrl && !currentAvatarUrl.includes('placeholder')) {
        const fileName = extractAvatarFileName(currentAvatarUrl);
        if (fileName) await supabase.storage.from('avatars').remove([fileName]);
      }

      // Update with new avatar
      onAvatarUpdate(newAvatarUrl);
      
      toast({
        title: "Avatar updated successfully",
        description: "Your profile picture has been updated."
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error updating avatar",
        description: "Failed to update your profile picture.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={className}>
      <FileUpload
        label="Profile Avatar"
        uploadType="avatar"
        onUploadComplete={handleAvatarUpload}
        maxFiles={1}
        existingFiles={currentAvatarUrl ? [currentAvatarUrl] : []}
      />
      
      {currentAvatarUrl && (
        <div className="mt-4 text-center">
          <div className="inline-block relative">
            <OptimizedImage 
              src={currentAvatarUrl} 
              alt="Current avatar" 
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
              onError={(e: any) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Current Avatar</p>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatarUpload;

