import { useState } from "react";
import EvaluationForm from "@/components/EvaluationForm";
import EvaluationResults from "@/components/EvaluationResults";
import { Score } from "@/types/evaluation";

const Index = () => {
  const [scores, setScores] = useState<Score>({
    sort: 0,
    setInOrder: 0,
    shine: 0,
    standardize: 0,
    sustain: 0,
  });
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        5S Workspace Evaluation
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        <EvaluationForm
          onEvaluationComplete={(newScores) => {
            setScores(newScores);
          }}
        />
        <EvaluationResults
          scores={scores}
          workspaceId={selectedWorkspace || null}
        />
      </div>
    </div>
  );
};

export default Index;