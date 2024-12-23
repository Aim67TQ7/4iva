import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Workspace {
  id: string;
  name: string;
  location: string | null;
}

interface WorkspaceSelectorProps {
  onSelect: (workspaceId: string) => void;
  companyId?: string;
}

const WorkspaceSelector = ({ onSelect, companyId }: WorkspaceSelectorProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!companyId) {
        console.log("No company ID provided to WorkspaceSelector");
        return;
      }

      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, location")
        .eq("company_id", companyId);

      if (error) {
        console.error("Error fetching workspaces:", error);
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log("No workspaces found for company:", companyId);
        toast({
          title: "No Workspaces",
          description: "No workspaces found for this company",
        });
        return;
      }

      // Sort workspaces alphabetically
      const sortedWorkspaces = data.sort((a, b) => a.name.localeCompare(b.name));
      setWorkspaces(sortedWorkspaces);
    };

    fetchWorkspaces();
  }, [toast, companyId]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Workspace</label>
      <Select onValueChange={onSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name} {workspace.location && `(${workspace.location})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSelector;