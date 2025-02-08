import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Component, type ResourceTier } from "@shared/schema";
import { useLocation } from "wouter";

interface PreviewProps {
  selectedOS: string;
  selectedComponents: Component[];
  selectedResourceTier: ResourceTier | "";
  onScriptGenerated: () => void;
  onInstanceCreated: () => void;
}

export default function Preview({
  selectedOS,
  selectedComponents,
  selectedResourceTier,
  onScriptGenerated,
  onInstanceCreated,
}: PreviewProps) {
  const { toast } = useToast();
  const [scriptContent, setScriptContent] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isAuthChecking } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (res.status === 401) return null;
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        setLocation("/auth");
        return;
      }

      const res = await apiRequest("POST", "/api/generate", {
        os: selectedOS,
        selectedComponents: selectedComponents.map((c) => c.name),
        resourceTier: selectedResourceTier,
      });
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setScriptContent(data.generatedScript);
        onScriptGenerated();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate script",
        variant: "destructive",
      });
    },
  });

  const deployMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        setLocation("/auth");
        return;
      }

      const res = await apiRequest("POST", "/api/deploy", {
        os: selectedOS,
        selectedComponents: selectedComponents.map((c) => c.name),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Instance created successfully",
      });
      onInstanceCreated();
      setIsDeploying(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create instance",
        variant: "destructive",
      });
      setIsDeploying(false);
    },
  });

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vps-deploy-${selectedOS}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!selectedOS || selectedComponents.length === 0) {
    return (
      <div className="text-center py-8 px-4 text-muted-foreground">
        Select an OS and components to generate the script
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <h2 className="text-xl md:text-2xl font-semibold">Script Preview</h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || isAuthChecking}
            className="w-full sm:w-auto"
          >
            {!user ? "Sign in to Generate" : "Generate"}
          </Button>
          {scriptContent && user && (
            <>
              <Button 
                onClick={handleDownload} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => {
                  setIsDeploying(true);
                  deployMutation.mutate();
                }}
                disabled={isDeploying}
                className="w-full sm:w-auto"
              >
                {isDeploying ? "Creating Instance..." : "Create Instance"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="bg-muted p-4 overflow-x-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm md:text-base break-all">
          {scriptContent || (!user ? "Sign in to generate the script" : "Click Generate to preview the script")}
        </pre>
      </Card>
    </div>
  );
}