import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkspaceForm from "@/components/WorkspaceForm";
import { Pencil, Trash2 } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
}

const WorkspaceManagement = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const { toast } = useToast();

  const fetchCompanyId = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id")
      .limit(1)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load company",
        variant: "destructive",
      });
      return;
    }

    setCompanyId(data.id);
  };

  const fetchWorkspaces = async () => {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, location, description");

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

  useEffect(() => {
    fetchCompanyId();
    fetchWorkspaces();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Workspace deleted successfully",
    });
    fetchWorkspaces();
  };

  if (!companyId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Manage Workspaces</h1>
      
      <div className="mb-8">
        <WorkspaceForm
          onSuccess={() => {
            fetchWorkspaces();
            setEditingWorkspace(null);
          }}
          workspace={editingWorkspace}
          companyId={companyId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{workspace.name}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingWorkspace(workspace)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(workspace.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workspace.location && (
                <p className="text-sm text-gray-500">
                  Location: {workspace.location}
                </p>
              )}
              {workspace.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {workspace.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceManagement;