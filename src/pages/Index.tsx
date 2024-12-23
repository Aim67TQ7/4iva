import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import ScoreDisplay from "@/components/ScoreDisplay";
import Feedback from "@/components/Feedback";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import TrendsChart from "@/components/TrendsChart";
import { supabase } from "@/integrations/supabase/client";
import { convertToBase64, compressImage } from "@/utils/imageUtils";

export type Score = {
  sort: number;
  setInOrder: number;
  shine: number;
  standardize: number;
  sustain: number;
};

const Index = () => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [scores, setScores] = useState<Score>({
    sort: 0,
    setInOrder: 0,
    shine: 0,
    standardize: 0,
    sustain: 0,
  });
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUsingFrontCamera, setIsUsingFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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
  };

  const handleEvaluate = async () => {
    if (!selectedWorkspace) {
      toast({
        title: "No workspace selected",
        description: "Please select a workspace before evaluating",
        variant: "destructive",
      });
      return;
    }

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
      // Call the evaluate-workspace function with base64 photos
      const response = await fetch("/api/evaluate-workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photos }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate workspace");
      }

      const evaluation = await response.json();

      setScores({
        sort: evaluation.sortScore,
        setInOrder: evaluation.setInOrderScore,
        shine: evaluation.shineScore,
        standardize: evaluation.standardizeScore,
        sustain: evaluation.sustainScore,
      });

      const totalScore = Object.values(evaluation).reduce(
        (acc: number, score: number) => acc + (typeof score === "number" ? score : 0),
        0
      );

      const { error: dbError } = await supabase.from("evaluations").insert({
        workspace_id: selectedWorkspace,
        photos,
        sort_score: evaluation.sortScore,
        set_order_score: evaluation.setInOrderScore,
        shine_score: evaluation.shineScore,
        standardize_score: evaluation.standardizeScore,
        sustain_score: evaluation.sustainScore,
        feedback: evaluation.feedback,
        total_score: totalScore,
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

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg');
        const compressedImage = await compressImage(base64Image);
        setPhotos(prev => [...prev, compressedImage]);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">5S Workspace Evaluation</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Selection & Photo Capture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WorkspaceSelector onSelect={setSelectedWorkspace} />

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

            <PhotoUpload onUpload={handlePhotoUpload} photos={photos} />

            <Button
              onClick={handleEvaluate}
              className="w-full"
              disabled={!selectedWorkspace || photos.length === 0 || isEvaluating}
            >
              {isEvaluating ? "Evaluating..." : "Evaluate Workspace"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDisplay scores={scores} />
              <Feedback scores={scores} />
            </CardContent>
          </Card>

          {selectedWorkspace && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendsChart workspaceId={selectedWorkspace} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
