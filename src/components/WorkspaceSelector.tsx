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
}

const WorkspaceSelector = ({ onSelect }: WorkspaceSelectorProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name, location");

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
        return;
      }

      setWorkspaces(data);
    };

    fetchWorkspaces();
  }, [toast]);

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