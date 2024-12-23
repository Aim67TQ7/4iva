import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceFormProps {
  onSuccess: () => void;
  workspace?: {
    id: string;
    name: string;
    location: string | null;
    description: string | null;
  } | null;
}

interface FormValues {
  name: string;
  location: string;
  description: string;
}

const WorkspaceForm = ({ onSuccess, workspace }: WorkspaceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      location: "",
      description: "",
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        location: workspace.location || "",
        description: workspace.description || "",
      });
    } else {
      form.reset({
        name: "",
        location: "",
        description: "",
      });
    }
  }, [workspace, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (workspace) {
        const { error } = await supabase
          .from("workspaces")
          .update({
            name: values.name,
            location: values.location || null,
            description: values.description || null,
          })
          .eq("id", workspace.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workspace updated successfully",
        });
      } else {
        const { error } = await supabase.from("workspaces").insert([
          {
            name: values.name,
            location: values.location || null,
            description: values.description || null,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workspace created successfully",
        });
      }

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workspace",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {workspace ? "Update" : "Create"} Workspace
        </Button>
      </form>
    </Form>
  );
};

export default WorkspaceForm;