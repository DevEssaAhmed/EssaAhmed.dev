import { OptimizedImage } from "@/components/OptimizedImage";
import React, { useEffect, useId, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle, CheckCircle, Loader2, Link, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  existingFiles?: string[];
  uploadType: 'image' | 'video' | 'document' | 'avatar';
  multiple?: boolean;
  maxSizeMB?: number;
  showPreview?: boolean;
  allowUrlInput?: boolean;
  urlInputPlaceholder?: string;
  simultaneousMode?: boolean;
  enableImageEditing?: boolean; // For compatibility, but won't be used
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export const FileUpload = ({ 
  label = "Upload Files", 
  accept = "image/*", 
  onUploadComplete, 
  maxFiles = 1,
  existingFiles = [],
  uploadType,
  multiple = false,
  maxSizeMB = 50,
  showPreview = true,
  allowUrlInput = true,
  urlInputPlaceholder = "Enter URL...",
  simultaneousMode = false,
  enableImageEditing = false,
}: FileUploadProps) => {
  const idBase = useId();
  const uploadInputId = `file-upload-${idBase}`;
  const tabbedUploadInputId = `file-upload-tabbed-${idBase}`;

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  useEffect(() => {
    setUploadedFiles(existingFiles);
  }, [existingFiles]);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setIsValidUrl(urlInput.trim() !== '' && validateUrl(urlInput.trim()));
  }, [urlInput]);

  const getBucketName = (): string => {
    switch (uploadType) {
      case 'image':
        return 'images';
      case 'avatar':
        return 'avatars';
      case 'video':
        return 'videos';
      case 'document':
        return 'documents';
      default:
        return 'images';
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });
    if (!isValidType) {
      return `File type not supported. Accepted types: ${accept}`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const bucket = getBucketName();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type || `application/octet-stream`,
        upsert: true,
      });

    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const tryRemoveFromStorage = async (url: string) => {
    try {
      const bucket = getBucketName();
      const marker = `/storage/v1/object/public/${bucket}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return;
      const fileName = url.substring(idx + marker.length);
      if (!fileName) return;
      await supabase.storage.from(bucket).remove([fileName]);
    } catch (e) {
      console.warn('Failed to remove file from storage:', e);
    }
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const filesArr = Array.from(files);

    // Validate
    const validationErrors: string[] = [];
    filesArr.forEach((file, index) => {
      const error = validateFile(file);
      if (error) validationErrors.push(`File ${index + 1}: ${error}`);
    });
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'));
      return;
    }

    // Check total file limit
    const totalFiles = uploadedFiles.length + filesArr.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Currently have ${uploadedFiles.length}, trying to add ${filesArr.length}`);
      return;
    }

    setUploading(true);
    setUploadingFiles(filesArr.map(f => ({ file: f, progress: 0, status: 'uploading' })));

    try {
      const urls: (string | null)[] = [];
      for (let i = 0; i < filesArr.length; i++) {
        try {
          setUploadingFiles(prev => prev.map((u, idx) => idx === i ? { ...u, progress: 50 } : u));
          const url = await uploadFile(filesArr[i]);
          urls.push(url);
          setUploadingFiles(prev => prev.map((u, idx) => idx === i ? { ...u, status: 'completed', progress: 100, url } : u));
        } catch (err: any) {
          setUploadingFiles(prev => prev.map((u, idx) => idx === i ? { ...u, status: 'error', error: err.message } : u));
          urls.push(null);
        }
      }
      const newFiles = [...uploadedFiles, ...urls.filter(Boolean) as string[]].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
      toast.success(`${urls.filter(Boolean).length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadingFiles([]), 1500);
    }
  };

  const onFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await handleFilesUpload(files);
    event.target.value = '';
  };

  const handleUrlAdd = () => {
    const url = urlInput.trim();
    if (url && validateUrl(url)) {
      if (uploadedFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }
      const newFiles = [...uploadedFiles, url].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
      setUrlInput('');
      toast.success('URL added successfully');
    } else {
      toast.error('Please enter a valid URL');
    }
  };

  const removeFile = async (index: number) => {
    const url = uploadedFiles[index];
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
    if (url) await tryRemoveFromStorage(url);
  };

  const getFileTypeIcon = (uploadType: string) => {
    switch (uploadType) {
      case 'image':
      case 'avatar':
        return <ImageIcon className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'document':
        return <FileText className="w-8 h-8" />;
      default:
        return <Upload className="w-8 h-8" />;
    }
  };

  const renderFilePreview = (url: string, index: number) => {
    const isImage = uploadType === 'image' || uploadType === 'avatar';
    const isVideo = uploadType === 'video';
    
    return (
      <div key={index} className="relative group">
        {isImage && (
          <OptimizedImage 
            src={url} 
            alt={`Upload ${index + 1}`}
            className="w-20 h-20 object-cover rounded border"
            onError={(e: any) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJtMjEgMTUtMy0zLTYgNi02LTQtMy4zIDMuMyIvPjwvc3ZnPg==';
            }}
          />
        )}
        {isVideo && (
          <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-500" />
          </div>
        )}
        {!isImage && !isVideo && (
          <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        )}
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => void removeFile(index)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  const renderUploadArea = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={onFileInputChange}
          multiple={multiple}
          className="hidden"
          id={uploadInputId}
          disabled={uploading || uploadedFiles.length >= maxFiles}
        />
        <label 
          htmlFor={uploadInputId} 
          className={`cursor-pointer flex flex-col items-center space-y-2 ${
            uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {getFileTypeIcon(uploadType)}
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : `Click to upload ${uploadType}${multiple ? 's' : ''}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {uploadType === 'image' && 'PNG, JPG, GIF up to '}
              {uploadType === 'video' && 'MP4, MOV, AVI up to '}
              {uploadType === 'document' && 'PDF, DOC, TXT up to '}
              {maxSizeMB}MB
            </p>
          </div>
          {enableImageEditing && uploadType === 'image' && (
            <div className="text-xs text-blue-600 mt-1">
              Basic image upload enabled
            </div>
          )}
        </label>
      </div>

      {/* URL Input Section */}
      {allowUrlInput && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="url"
              placeholder={urlInputPlaceholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={uploading || uploadedFiles.length >= maxFiles}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleUrlAdd}
            disabled={!isValidUrl || uploading || uploadedFiles.length >= maxFiles}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderTabbedInterface = () => (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Upload Files
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <Link className="w-4 h-4" />
          Add URL
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upload" className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={onFileInputChange}
            multiple={multiple}
            className="hidden"
            id={tabbedUploadInputId}
            disabled={uploading || uploadedFiles.length >= maxFiles}
          />
          <label 
            htmlFor={tabbedUploadInputId} 
            className={`cursor-pointer flex flex-col items-center space-y-2 ${
              uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {getFileTypeIcon(uploadType)}
            <div>
              <p className="text-sm font-medium">
                {uploading ? 'Uploading...' : `Click to upload ${uploadType}${multiple ? 's' : ''}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {uploadType === 'image' && 'PNG, JPG, GIF up to '}
                {uploadType === 'video' && 'MP4, MOV, AVI up to '}
                {uploadType === 'document' && 'PDF, DOC, TXT up to '}
                {maxSizeMB}MB
              </p>
            </div>
          </label>
        </div>
      </TabsContent>
      <TabsContent value="url" className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="url"
              placeholder={urlInputPlaceholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={uploading || uploadedFiles.length >= maxFiles}
            />
          </div>
          <Button 
            onClick={handleUrlAdd}
            disabled={!isValidUrl || uploading || uploadedFiles.length >= maxFiles}
          >
            Add URL
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="w-full space-y-4">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      {simultaneousMode ? renderUploadArea() : renderTabbedInterface()}

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate">{file.file.name}</span>
                  <div className="flex items-center ml-2">
                    {file.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {file.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {file.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="mt-1" />
                )}
                {file.status === 'error' && file.error && (
                  <p className="text-red-500 text-xs mt-1">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </Label>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((url, index) => renderFilePreview(url, index))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;


