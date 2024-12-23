import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  photos: File[];
}

const PhotoUpload = ({ onUpload, photos }: PhotoUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 4
  });

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
            : "Drag & drop up to 4 workspace photos, or click to select"}
        </p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <Card key={index} className="relative p-2">
              <img
                src={URL.createObjectURL(photo)}
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