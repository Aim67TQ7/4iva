import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraCaptureProps {
  onPhotoCapture: (photo: string) => void;
}

const CameraCapture = ({ onPhotoCapture }: CameraCaptureProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUsingFrontCamera, setIsUsingFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isUsingFrontCamera ? "user" : "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setIsUsingFrontCamera(!isUsingFrontCamera);
    startCamera();
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg');
        onPhotoCapture(base64Image);
      }
    }
  };

  return (
    <div className="space-y-4">
      {isCameraActive ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute inset-0 border-2 border-dashed border-primary opacity-50 pointer-events-none" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-4">
            <Button onClick={capturePhoto}>Capture</Button>
            <Button onClick={switchCamera}>Switch Camera</Button>
            <Button variant="secondary" onClick={stopCamera}>
              Close Camera
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={startCamera} className="w-full">
          <Camera className="mr-2" />
          Open Camera
        </Button>
      )}
    </div>
  );
};

export default CameraCapture;