import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [companyId, setCompanyId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDefaultCompany = async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id")
        .eq("name", "n0v8v")
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch company information",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Default company not found",
          variant: "destructive",
        });
        return;
      }

      setCompanyId(data.id);
    };

    fetchDefaultCompany();
  }, [toast]);

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
          companyId={companyId}
          onWorkspaceSelect={setSelectedWorkspace}
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