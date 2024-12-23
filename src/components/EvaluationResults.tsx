import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreDisplay from "@/components/ScoreDisplay";
import Feedback from "@/components/Feedback";
import TrendsChart from "@/components/TrendsChart";
import { Score } from "@/types/evaluation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EvaluationResultsProps {
  scores: Score;
  workspaceId: string | null;
}

const EvaluationResults = ({ scores, workspaceId }: EvaluationResultsProps) => {
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const hasScores = Object.values(scores).some(score => score > 0);
  
  useEffect(() => {
    const fetchWorkspaceName = async () => {
      if (!workspaceId) return;
      
      const { data, error } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", workspaceId)
        .single();
        
      if (!error && data) {
        setWorkspaceName(data.name);
      }
    };
    
    fetchWorkspaceName();
  }, [workspaceId]);

  if (!hasScores) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{workspaceName || "Select a Workspace"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Evaluate a workspace to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{workspaceName}</CardTitle>
          <p className="text-sm text-gray-500">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </CardHeader>
        <CardContent>
          <ScoreDisplay scores={scores} />
          <Feedback scores={scores} />
        </CardContent>
      </Card>

      {workspaceId && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendsChart workspaceId={workspaceId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EvaluationResults;