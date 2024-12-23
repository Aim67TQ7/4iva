import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PhotoUpload from "@/components/PhotoUpload";
import CameraCapture from "@/components/CameraCapture";

interface PhotoSectionProps {
  onPhotosChange: (photos: string[]) => void;
}

const PhotoSection = ({ onPhotosChange }: PhotoSectionProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const { toast } = useToast();

  const handlePhotoUpload = (base64Photos: string[]) => {
    if (base64Photos.length > 4) {
      toast({
        title: "Too many photos",
        description: "Please upload a maximum of 4 photos",
        variant: "destructive",
      });
      return;
    }
    setPhotos(base64Photos);
    onPhotosChange(base64Photos);
  };

  const handleCameraCapture = (photo: string) => {
    const newPhotos = [...photos, photo];
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <CameraCapture onPhotoCapture={handleCameraCapture} />
      <PhotoUpload onUpload={handlePhotoUpload} photos={photos} />
    </div>
  );
};

export default PhotoSection;