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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDefaultCompany = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id")
          .eq("name", "n0v8v")
          .maybeSingle();

        if (error) {
          console.error("Error fetching company:", error);
          toast({
            title: "Error",
            description: "Failed to fetch company information",
            variant: "destructive",
          });
          return;
        }

        if (!data) {
          console.error("Company 'n0v8v' not found");
          toast({
            title: "Error",
            description: "Default company not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Company found:", data);
        setCompanyId(data.id);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaultCompany();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error: Company not found. Please ensure the default company exists in the database.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Optimize Your Space
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