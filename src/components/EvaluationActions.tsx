import { Button } from "@/components/ui/button";
import { Loader2, Save, RefreshCw } from "lucide-react";

interface EvaluationActionsProps {
  onEvaluate: () => void;
  onSavePDF: () => void;
  onNewEvaluation: () => void;
  isEvaluating: boolean;
  isDisabled: boolean;
}

const EvaluationActions = ({
  onEvaluate,
  onSavePDF,
  onNewEvaluation,
  isEvaluating,
  isDisabled,
}: EvaluationActionsProps) => {
  return (
    <div className="space-y-2">
      <Button
        onClick={onEvaluate}
        className="w-full"
        disabled={isDisabled || isEvaluating}
      >
        {isEvaluating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          "Evaluate Workspace"
        )}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={onSavePDF}
          variant="outline"
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          Save to PDF
        </Button>
        <Button
          onClick={onNewEvaluation}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Evaluation
        </Button>
      </div>
    </div>
  );
};

export default EvaluationActions;