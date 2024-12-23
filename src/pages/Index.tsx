import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import PhotoUpload from "@/components/PhotoUpload";
import ScoreDisplay from "@/components/ScoreDisplay";
import Feedback from "@/components/Feedback";
import { calculateTotalScore } from "@/utils/scoring";

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
  const { toast } = useToast();

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

  const handleEvaluate = () => {
    if (photos.length === 0) {
      toast({
        title: "No photos",
        description: "Please upload at least one photo",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, setting random scores
    const newScores = {
      sort: Math.floor(Math.random() * 5) + 1,
      setInOrder: Math.floor(Math.random() * 5) + 1,
      shine: Math.floor(Math.random() * 5) + 1,
      standardize: Math.floor(Math.random() * 5) + 1,
      sustain: Math.floor(Math.random() * 5) + 1,
    };
    
    setScores(newScores);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">5S Workspace Evaluation</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload onUpload={handlePhotoUpload} photos={photos} />
            <Button 
              onClick={handleEvaluate} 
              className="w-full mt-4"
              disabled={photos.length === 0}
            >
              Evaluate Workspace
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