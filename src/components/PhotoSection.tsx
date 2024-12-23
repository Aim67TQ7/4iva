import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import PhotoUpload from "@/components/PhotoUpload";
import CameraCapture from "@/components/CameraCapture";

interface PhotoSectionProps {
  onPhotosChange: (photos: string[]) => void;
}

const PhotoSection = ({ onPhotosChange }: PhotoSectionProps) => {
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
    onPhotosChange(base64Photos);
  };

  const handleCameraCapture = (photo: string) => {
    onPhotosChange(prev => [...prev, photo]);
  };

  return (
    <div className="space-y-4">
      <CameraCapture onPhotoCapture={handleCameraCapture} />
      <PhotoUpload onUpload={handlePhotoUpload} photos={[]} />
    </div>
  );
};

export default PhotoSection;