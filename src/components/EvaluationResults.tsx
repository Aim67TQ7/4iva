import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScoreDisplay from "@/components/ScoreDisplay";
import Feedback from "@/components/Feedback";
import TrendsChart from "@/components/TrendsChart";
import { Score } from "@/types/evaluation";

interface EvaluationResultsProps {
  scores: Score;
  workspaceId: string | null;
}

const EvaluationResults = ({ scores, workspaceId }: EvaluationResultsProps) => {
  return (
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