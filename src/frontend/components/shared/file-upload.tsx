import { useState, useRef } from 'react';
import { Button } from '@/frontend/components/ui/button';
import { Progress } from '@/frontend/components/ui/progress';
import { toast } from '@/frontend/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { errorMessages } from '@/backend/config/errors';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete: (fileUrl: string) => void;
  className?: string;
}

export function FileUpload({ 
  accept = '.pdf,.doc,.docx',
  maxSize = 50, // default 50MB
  onUploadComplete,
  className 
}: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validate file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = accept.split(',').map(type => 
      type.trim().replace('.', '').toLowerCase()
    );
    
    if (!fileType || !allowedTypes.includes(fileType)) {
      toast({
        title: 'Error',
        description: errorMessages.upload.invalidType.replace(
          '{formats}',
          accept
        ),
        variant: 'destructive'
      });
      return false;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'Error',
        description: errorMessages.upload.sizeExceeded.replace(
          '{maxSize}',
          maxSize.toString()
        ),
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      const promise = new Promise<{ fileUrl: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(errorMessages.upload.uploadFailed));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error(errorMessages.upload.uploadFailed));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const data = await promise;
      onUploadComplete(data.fileUrl);
      
      toast({
        title: 'Success',
        description: 'File berhasil diunggah',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: errorMessages.upload.uploadFailed,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        {/* Upload button or file info */}
        {!selectedFile ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Pilih File
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-gray-500 text-center">
              {progress}%
            </p>
          </div>
        )}

        {/* Upload button */}
        {selectedFile && !isUploading && (
          <Button
            type="button"
            onClick={handleUpload}
            className="w-full"
          >
            Upload File
          </Button>
        )}

        {/* File requirements */}
        <p className="text-sm text-gray-500">
          Format yang didukung: {accept}. Maksimal {maxSize}MB
        </p>
      </div>
    </div>
  );
}