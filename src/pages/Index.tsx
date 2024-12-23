import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import ScoreDisplay from "@/components/ScoreDisplay";
import Feedback from "@/components/Feedback";
import { supabase } from "@/integrations/supabase/client";

export type Score = {
  sort: number;
  setInOrder: number;
  shine: number;
  standardize: number;
  sustain: number;
};

const Index = () => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [scores, setScores] = useState<Score>({
    sort: 0,
    setInOrder: 0,
    shine: 0,
    standardize: 0,
    sustain: 0,
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUsingFrontCamera, setIsUsingFrontCamera] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive",
      });
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
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhotos(prev => [...prev, file]);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handlePhotoUpload = (files: File[]) => {
    if (files.length > 4) {
      toast({
        title: "Too many photos",
        description: "Please upload a maximum of 4 photos",
        variant: "destructive",
      });
      return;
    }
    setPhotos(files);
  };

  const handleEvaluate = async () => {
    if (photos.length === 0) {
      toast({
        title: "No photos",
        description: "Please upload at least one photo",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    try {
      // Upload photos to Supabase Storage
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          const fileName = `${crypto.randomUUID()}-${photo.name}`;
          const { data, error } = await supabase.storage
            .from('workspace_photos')
            .upload(fileName, photo);
          
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('workspace_photos')
            .getPublicUrl(fileName);
            
          return publicUrl;
        })
      );

      // Call the evaluate-workspace function
      const response = await fetch('/api/evaluate-workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrls }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate workspace');
      }

      const evaluation = await response.json();
      
      // Update scores
      setScores({
        sort: evaluation.sortScore,
        setInOrder: evaluation.setInOrderScore,
        shine: evaluation.shineScore,
        standardize: evaluation.standardizeScore,
        sustain: evaluation.sustainScore,
      });

      // Save evaluation to database
      const { error: dbError } = await supabase
        .from('evaluations')
        .insert({
          photos: photoUrls,
          sort_score: evaluation.sortScore,
          set_order_score: evaluation.setInOrderScore,
          shine_score: evaluation.shineScore,
          standardize_score: evaluation.standardizeScore,
          sustain_score: evaluation.sustainScore,
          feedback: evaluation.feedback,
          total_score: Object.values(evaluation).reduce((a: number, b: number) => 
            typeof b === 'number' ? a + b : a, 0)
        });

      if (dbError) throw dbError;

      toast({
        title: "Evaluation Complete",
        description: "Your workspace has been evaluated successfully",
      });
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">5S Workspace Evaluation</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capture or Upload Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <Button onClick={capturePhoto}>
                    Capture
                  </Button>
                  <Button onClick={switchCamera}>
                    Switch Camera
                  </Button>
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
            
            <PhotoUpload onUpload={handlePhotoUpload} photos={photos} />
            
            <Button 
              onClick={handleEvaluate} 
              className="w-full"
              disabled={photos.length === 0 || isEvaluating}
            >
              {isEvaluating ? "Evaluating..." : "Evaluate Workspace"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDisplay scores={scores} />
            <Feedback scores={scores} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;