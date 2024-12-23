import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PhotoUpload from "@/components/PhotoUpload";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import CameraCapture from "@/components/CameraCapture";
import { supabase } from "@/integrations/supabase/client";
import { Score } from "@/types/evaluation";

interface EvaluationFormProps {
  onEvaluationComplete: (scores: Score) => void;
  companyId: string;
  onWorkspaceSelect: (workspaceId: string) => void;
}

const EvaluationForm = ({ onEvaluationComplete, companyId, onWorkspaceSelect }: EvaluationFormProps) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState(false);
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

  const handleCameraCapture = (photo: string) => {
    setPhotos(prev => [...prev, photo]);
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

      const scores = {
        sort: evaluation.sortScore || 0,
        setInOrder: evaluation.setInOrderScore || 0,
        shine: evaluation.shineScore || 0,
        standardize: evaluation.standardizeScore || 0,
        sustain: evaluation.sustainScore || 0,
      };

      const totalScore = [
        evaluation.sortScore,
        evaluation.setInOrderScore,
        evaluation.shineScore,
        evaluation.standardizeScore,
        evaluation.sustainScore
      ].reduce((acc, score) => acc + (typeof score === 'number' ? score : 0), 0);

      const { error: dbError } = await supabase.from("evaluations").insert({
        workspace_id: selectedWorkspace,
        company_id: companyId,
        photos: photos,
        sort_score: evaluation.sortScore || null,
        set_order_score: evaluation.setInOrderScore || null,
        shine_score: evaluation.shineScore || null,
        standardize_score: evaluation.standardizeScore || null,
        sustain_score: evaluation.sustainScore || null,
        feedback: evaluation.feedback || null,
        total_score: totalScore || null,
      });

      if (dbError) throw dbError;

      onEvaluationComplete(scores);
      onWorkspaceSelect(selectedWorkspace);

      toast({
        title: "Evaluation Complete",
        description: "Your workspace has been evaluated successfully",
      });
    } catch (error) {
      console.error("Evaluation error:", error);
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
    <Card>
      <CardHeader>
        <CardTitle>Workspace Selection & Photo Capture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkspaceSelector 
          onSelect={(id) => {
            setSelectedWorkspace(id);
            onWorkspaceSelect(id);
          }} 
          companyId={companyId}
        />
        <CameraCapture onPhotoCapture={handleCameraCapture} />
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
  );
};

export default EvaluationForm;