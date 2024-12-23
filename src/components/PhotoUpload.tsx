import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { validateImageSize, convertToBase64, compressImage, MAX_FILE_SIZE } from "@/utils/imageUtils";

interface PhotoUploadProps {
  onUpload: (files: string[]) => void;
  photos: string[];
}

const PhotoUpload = ({ onUpload, photos }: PhotoUploadProps) => {
  const { toast } = useToast();

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!validateImageSize(file)) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum size of 20MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    try {
      const base64Promises = validFiles.map(async (file) => {
        const base64 = await convertToBase64(file);
        return await compressImage(base64);
      });

      const base64Results = await Promise.all(base64Promises);
      onUpload(base64Results);
    } catch (error) {
      toast({
        title: "Error processing images",
        description: "Failed to process one or more images",
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 4,
    maxSize: MAX_FILE_SIZE,
  });

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onUpload(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Drop the photos here..."
            : "Drag & drop up to 4 workspace photos (max 20MB each), or click to select"}
        </p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative p-2">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => removePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={photo}
                alt={`Workspace photo ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;