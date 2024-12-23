import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TrendsChartProps {
  workspaceId: string;
}

interface Evaluation {
  created_at: string;
  total_score: number;
}

const TrendsChart = ({ workspaceId }: TrendsChartProps) => {
  const [data, setData] = useState<Evaluation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvaluations = async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("created_at, total_score")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load evaluation history",
          variant: "destructive",
        });
        return;
      }

      setData(data);
    };

    if (workspaceId) {
      fetchEvaluations();
    }
  }, [workspaceId, toast]);

  const chartData = data.map((evaluation) => ({
    date: format(new Date(evaluation.created_at), "MMM d, yyyy"),
    score: evaluation.total_score,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 25]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendsChart;